/**
 * TMDB Service for MovieCloud
 * Handles TMDB API integration for movie metadata enrichment
 */

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// Fallback poster search using Wikipedia/Wikimedia API
async function searchPosterFallback(title, year) {
  // Return null - let the frontend FallbackImage component handle missing posters
  return null;
}

// Get backdrop from Unsplash
async function searchBackdropFallback(title, year) {
  // Return null - let the frontend FallbackImage component handle missing backdrops
  return null;
}

// Rate limiting: 40 requests per 10 seconds
let requestQueue = [];
let lastRequestTime = 0;

async function queueRequest(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (requestQueue.length === 0) return;
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < 250) { // ~40 requests per 10 seconds
    setTimeout(processQueue, 250 - timeSinceLastRequest);
    return;
  }
  
  const { fn, resolve, reject } = requestQueue.shift();
  lastRequestTime = Date.now();
  
  try {
    const result = await fn();
    resolve(result);
  } catch (error) {
    reject(error);
  }
}

/**
 * Search for a movie on TMDB
 * @param {string} title - Movie title
 * @param {number} year - Release year (optional)
 * @returns {Promise<object|null>} - TMDB search result or null
 */
async function searchMovie(title, year = null) {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
    console.warn('TMDB API key not configured, using fallbacks');
    return null;
  }

  console.log(`Searching TMDB for: "${title}" (${year})`);

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: title,
      language: 'en-US',
    });
    
    if (year) {
      params.append('year', year.toString());
    }

    const response = await queueRequest(() =>
      fetch(`${TMDB_BASE_URL}/search/movie?${params}`)
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0]; // Return first match
    }
    
    return null;
  } catch (error) {
    console.error('TMDB search error:', error);
    return null;
  }
}

/**
 * Get full movie details from TMDB
 * @param {number} tmdbId - TMDB movie ID
 * @returns {Promise<object|null>} - Full movie details or null
 */
async function getMovieDetails(tmdbId) {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      append_to_response: 'credits,videos',
    });

    const response = await queueRequest(() =>
      fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?${params}`)
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('TMDB details error:', error);
    return null;
  }
}

/**
 * Download and cache a poster image
 * @param {string} posterPath - TMDB poster path (e.g., "/abc123.jpg")
 * @param {string} movieSlug - Movie slug for filename
 * @returns {Promise<string|null>} - Local path to cached poster or null
 */
async function downloadAndCachePoster(posterPath, movieSlug, originalTitle = null, year = null) {
  if (!posterPath) {
    // Try fallback search
    const fallbackUrl = await searchPosterFallback(originalTitle || movieSlug, year);
    if (fallbackUrl) {
      posterPath = fallbackUrl;
    } else {
      return null;
    }
  }

  try {
    const cacheDir = process.env.POSTER_CACHE_DIR || './public/posters';
    await fs.ensureDir(cacheDir);

    const posterUrl = posterPath.startsWith('http') ? posterPath : `${TMDB_IMAGE_BASE}/w500${posterPath}`;
    const response = await fetch(posterUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download poster: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    
    const safeSlug = movieSlug.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const posterPathLocal = path.join(cacheDir, `${safeSlug}-poster.jpg`);
    
    await sharp(Buffer.from(buffer))
      .jpeg({ quality: 85 })
      .toFile(posterPathLocal);

    return `/posters/${safeSlug}-poster.jpg`;
  } catch (error) {
    console.error('Poster download error:', error);
    return null;
  }
}

async function downloadAndCacheBackdrop(backdropPath, movieSlug, originalTitle = null, year = null) {
  if (!backdropPath) {
    // Try fallback search
    const fallbackUrl = await searchBackdropFallback(originalTitle || movieSlug, year);
    if (fallbackUrl) {
      backdropPath = fallbackUrl;
    } else {
      return null;
    }
  }

  try {
    const cacheDir = process.env.BACKDROP_CACHE_DIR || './public/backdrops';
    await fs.ensureDir(cacheDir);

    const backdropUrl = backdropPath.startsWith('http') ? backdropPath : `${TMDB_IMAGE_BASE}/w780${backdropPath}`;
    const response = await fetch(backdropUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download backdrop: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const safeSlug = movieSlug.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const backdropPathLocal = path.join(cacheDir, `${safeSlug}-backdrop.jpg`);
    
    await sharp(Buffer.from(buffer))
      .jpeg({ quality: 85 })
      .toFile(backdropPathLocal);

    return `/backdrops/${safeSlug}-backdrop.jpg`;
  } catch (error) {
    console.error('Backdrop download error:', error);
    return null;
  }
}

/**
 * Enrich movie data with TMDB metadata
 * @param {object} parsedFilename - Parsed filename data
 * @returns {Promise<object>} - Enriched movie data
 */
async function enrichMovie(parsedFilename) {
  const enriched = {
    ...parsedFilename,
    synopsis: null,
    rating: null,
    posterUrl: null,
    backdropUrl: null,
    trailerUrl: null,
    cast: null,
    director: null,
    duration: null,
    language: null,
    tmdbId: null,
    tmdbMatched: false,
  };

  // Search TMDB
  const searchResult = await searchMovie(parsedFilename.title, parsedFilename.year);
  
  if (searchResult) {
    console.log(`TMDB matched: ${searchResult.title} (ID: ${searchResult.id})`);
    enriched.tmdbId = searchResult.id;
    enriched.tmdbMatched = true;
    
    // Get full details
    const details = await getMovieDetails(searchResult.id);
    
    if (details) {
      enriched.synopsis = details.overview;
      enriched.rating = details.vote_average;
      enriched.duration = details.runtime;
      enriched.language = details.original_language;
      
      // Poster
      if (details.poster_path) {
        enriched.posterUrl = `${TMDB_IMAGE_BASE}/w500${details.poster_path}`;
      }
      
      // Backdrop
      if (details.backdrop_path) {
        enriched.backdropUrl = `${TMDB_IMAGE_BASE}/w780${details.backdrop_path}`;
      }
      
      // Trailer
      if (details.videos?.results) {
        const trailer = details.videos.results.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (trailer) {
          enriched.trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
        }
      }
      
      // Cast and director
      if (details.credits) {
        enriched.cast = details.credits.cast
          ?.slice(0, 10)
          .map(c => c.name) || null;
        
        const director = details.credits.crew?.find(c => c.job === 'Director');
        enriched.director = director?.name || null;
      }
      
      // Genres from TMDB
      if (details.genres) {
        enriched.tmdbGenres = details.genres.map(g => g.name);
      }
    }
  }

  // If no TMDB data, leave posterUrl/backdropUrl as null
  // The frontend FallbackImage component will show a gradient placeholder

  return enriched;
}

module.exports = {
  searchMovie,
  getMovieDetails,
  downloadAndCachePoster,
  enrichMovie,
};
