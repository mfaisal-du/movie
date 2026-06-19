const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const path = require('path');
const fs = require('fs-extra');

const POSTER_CACHE_DIR = path.join(__dirname, '../../../public/posters');
const BACKDROP_CACHE_DIR = path.join(__dirname, '../../../public/backdrops');

// GET /api/v1/image/poster/:id - Serve cached poster
router.get('/poster/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [movies] = await pool.query(
      'SELECT poster_url, title FROM movies WHERE id = ?',
      [id]
    );

    if (movies.length === 0) {
      return res.redirect(`https://placehold.co/500x750/1a1a1a/ffffff?text=${encodeURIComponent(id)}`);
    }

    const movie = movies[0];

    // If we have a local cached poster, serve it directly
    if (movie.poster_url && movie.poster_url.startsWith('/posters/')) {
      const localPath = path.join(POSTER_CACHE_DIR, path.basename(movie.poster_url));
      if (await fs.pathExists(localPath)) {
        return res.sendFile(localPath);
      }
    }

    // If no TMDB poster, use Unsplash source for movie-style placeholder
    if (!movie.poster_url) {
      const placeholder = `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(movie.title || id)}`;
      return res.redirect(placeholder);
    }
    
    // For now, redirect to TMDB URL
    res.redirect(movie.poster_url);
  } catch (error) {
    console.error('Error serving poster:', error);
    res.redirect(`https://placehold.co/500x750/1a1a1a/ffffff?text=error`);
  }
});

// GET /api/v1/image/backdrop/:id - Serve cached backdrop
router.get('/backdrop/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [movies] = await pool.query(
      'SELECT backdrop_url, title FROM movies WHERE id = ?',
      [id]
    );

    if (movies.length === 0) {
      return res.redirect(`https://placehold.co/1280x720/1a1a1a/ffffff?text=${encodeURIComponent(id)}`);
    }

    const movie = movies[0];

    // If we have a local cached backdrop, serve it directly
    if (movie.backdrop_url && movie.backdrop_url.startsWith('/backdrops/')) {
      const localPath = path.join(BACKDROP_CACHE_DIR, path.basename(movie.backdrop_url));
      if (await fs.pathExists(localPath)) {
        return res.sendFile(localPath);
      }
    }

    // If no TMDB backdrop, use placeholder service
    if (!movie.backdrop_url) {
      const placeholder = `https://placehold.co/1280x720/1a1a1a/ffffff?text=${encodeURIComponent(movie.title || id)}`;
      return res.redirect(placeholder);
    }
    
    res.redirect(movie.backdrop_url);
  } catch (error) {
    console.error('Error serving backdrop:', error);
    res.redirect(`https://placehold.co/1280x720/1a1a1a/ffffff?text=error`);
  }
});

module.exports = router;