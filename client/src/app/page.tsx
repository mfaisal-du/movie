'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import HeroBanner from '../components/movie/HeroBanner';
import MovieRow from '../components/movie/MovieRow';
import ContinueWatchingRow from '../components/movie/ContinueWatchingRow';
import { Film, Wifi, WifiOff, Play, Clapperboard } from 'lucide-react';
import Link from 'next/link';
import { useWatchProgressStore } from '../stores';
import { Movie } from '../types';

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Record<string, Movie[]>>({});
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [continueWatchingMovies, setContinueWatchingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContinueWatching, setIsLoadingContinueWatching] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const { progress } = useWatchProgressStore();

  useEffect(() => {
    // Set loading to false immediately so welcome screen shows
    setIsLoading(false);
    setIsLoadingContinueWatching(false);
    
    const fetchData = async () => {
      try {
        setApiError(null);
        
        // Try to fetch data from the API
        const [featuredRes, recentRes, popularRes, trendingRes] = await Promise.allSettled([
          fetch('/api/v1/movies/featured'),
          fetch('/api/v1/movies/recent?limit=20'),
          fetch('/api/v1/movies/popular?limit=20'),
          fetch('/api/v1/movies?sort=view_count&order=desc&limit=15'),
        ]);

        // Check if any request succeeded
        let hasData = false;

        // Handle featured movies
        if (featuredRes.status === 'fulfilled' && featuredRes.value.ok) {
          try {
            const featuredData = await featuredRes.value.json();
            if (featuredData.success && featuredData.data.movies?.length > 0) {
              setFeaturedMovies(featuredData.data.movies);
              hasData = true;
            }
          } catch (e) {}
        }

        // Handle recent movies
        if (recentRes.status === 'fulfilled' && recentRes.value.ok) {
          try {
            const recentData = await recentRes.value.json();
            if (recentData.success && recentData.data.movies?.length > 0) {
              setRecentMovies(recentData.data.movies);
              hasData = true;
            }
          } catch (e) {}
        }

        // Handle popular movies
        if (popularRes.status === 'fulfilled' && popularRes.value.ok) {
          try {
            const popularData = await popularRes.value.json();
            if (popularData.success && popularData.data.movies?.length > 0) {
              setPopularMovies(popularData.data.movies);
              hasData = true;
            }
          } catch (e) {}
        }

        // Handle trending movies
        if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
          try {
            const trendingData = await trendingRes.value.json();
            if (trendingData.success && trendingData.data.movies?.length > 0) {
              setTrendingMovies(trendingData.data.movies);
              hasData = true;
            }
          } catch (e) {}
        }

        // Handle genre movies
        const genres = ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'thriller', 'animation'];
        const genreResults = await Promise.allSettled(
          genres.map(async (genre) => {
            const res = await fetch(`/api/v1/movies/genre/${genre}?limit=20`);
            if (!res.ok) return { genre, movies: [] };
            const data = await res.json();
            return { genre, movies: data.success ? data.data.movies : [] };
          })
        );

        const genreMap: Record<string, Movie[]> = {};
        genreResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { genre, movies } = result.value;
            if (movies && movies.length > 0) {
              genreMap[genre] = movies;
              hasData = true;
            }
          }
        });
        setGenreMovies(genreMap);

        // If we got no data at all, show error
        if (!hasData) {
          setApiError('Unable to connect to the server. Please make sure the backend is running.');
        } else {
          setShowWelcome(false);
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
        setApiError('Failed to load data. Please check your connection and try again.');
      }
    };

    fetchData();

    // Fetch continue watching movies
    const fetchContinueWatching = async () => {
      const movieIds = Object.keys(progress);
      if (movieIds.length === 0) {
        setIsLoadingContinueWatching(false);
        return;
      }

      try {
        const moviePromises = movieIds.map(id => 
          fetch(`/api/v1/movies/${id}`).then(res => res.ok ? res.json() : null)
        );
        const results = await Promise.allSettled(moviePromises);
        const movies = results
          .filter((r): r is PromiseFulfilledResult<{data: Movie}> => 
            r.status === 'fulfilled' && r.value?.data
          )
          .map(r => r.value.data);
        setContinueWatchingMovies(movies);
      } catch (error) {
        console.error('Failed to fetch continue watching:', error);
      } finally {
        setIsLoadingContinueWatching(false);
      }
    };

    fetchContinueWatching();

    // Auto-refresh every 30 seconds to pick up new movies
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="min-h-screen bg-cinematic-dark">
      <main>
        <HeroBanner movies={featuredMovies} isLoading={isLoading} />
        
        {/* API Error Banner */}
        {apiError && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 mx-4 md:mx-8 -mt-8 mb-8"
          >
            <div className="glass-strong rounded-2xl p-6 border border-accent-red/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-red/20 flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-accent-red" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-display text-text-primary mb-1">Server Connection Issue</h3>
                  <p className="text-text-secondary text-sm">{apiError}</p>
                  <div className="mt-4 p-4 bg-bg-surface/50 rounded-xl">
                    <p className="text-xs text-text-muted font-medium mb-2">To fix this, start the backend server:</p>
                    <code className="text-xs text-brand bg-bg-primary px-3 py-2 rounded-lg block">
                      cd ../server && node server.js
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
<div className="relative z-10 mt-4 md:mt-8">
           {/* Continue Watching - Show progress movies */}
           <ContinueWatchingRow movies={continueWatchingMovies} isLoading={isLoadingContinueWatching} />

           {/* Trending Movies - Sorted by view count */}
           {trendingMovies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <MovieRow
                title="Trending Now"
                movies={trendingMovies}
                isLoading={false}
              />
            </motion.div>
          )}

          {/* Recently Added - First section after hero */}
          {recentMovies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <MovieRow
                title="Recently Added"
                movies={recentMovies}
                isLoading={false}
              />
            </motion.div>
          )}

          {/* Most Popular - Right after Recently Added */}
          {popularMovies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MovieRow
                title="Most Popular"
                movies={popularMovies}
                isLoading={false}
              />
            </motion.div>
          )}

          {/* Genre Rows */}
          {Object.entries(genreMovies).map(([genre, movies], index) => (
            movies.length > 0 && (
              <motion.div
                key={genre}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (0.1 * index) }}
              >
                <MovieRow
                  title={`${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`}
                  movies={movies}
                  genreSlug={genre}
                  isLoading={false}
                />
              </motion.div>
            )
          ))}

          {/* Empty State - No Movies */}
          {!isLoading && featuredMovies.length === 0 && Object.keys(genreMovies).length === 0 && recentMovies.length === 0 && popularMovies.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-surface flex items-center justify-center">
                <Film className="w-12 h-12 text-text-muted" />
              </div>
              <h2 className="text-2xl font-display text-text-primary mb-3">No Movies Available</h2>
              <p className="text-text-muted max-w-md mx-auto mb-6">
                {apiError 
                  ? "Unable to load movies. Please make sure the backend server is running."
                  : "No movies have been added yet. Start by adding movies to your collection."
                }
              </p>
              {apiError && (
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-text-secondary">
                  <Wifi className="w-4 h-4" />
                  Check server connection
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-12 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-brand" />
              <span className="text-xl font-display">
                Movie<span className="text-brand">Cloud</span>
              </span>
            </div>
            <p className="text-sm text-text-muted">
              © 2026 MovieCloud. Stream your favorite movies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
