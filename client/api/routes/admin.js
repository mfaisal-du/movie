const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { scanLibrary } = require('../services/scanner');

// Simple password middleware
const requireAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /api/v1/admin/scan - Trigger library scan
router.post('/scan', requireAuth, async (req, res) => {
  try {
    const result = await scanLibrary('full');
    res.json({
      success: true,
      message: `Scan complete: ${result.totalNew} new, ${result.totalUpdated} updated`,
      data: result,
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed: ' + error.message });
  }
});

// GET /api/v1/admin/stats - Dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [totalMovies] = await pool.query(
      'SELECT COUNT(*) as total FROM movies WHERE is_active = 1'
    );
    
    const [totalSize] = await pool.query(
      'SELECT SUM(file_size) as total FROM movies WHERE is_active = 1'
    );
    
    const [genreStats] = await pool.query(
      `SELECT g.name, g.slug, COUNT(DISTINCT mg.movie_id) as count
       FROM genres g
       LEFT JOIN movie_genres mg ON g.id = mg.genre_id
       LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
       GROUP BY g.id
       ORDER BY count DESC`
    );

    const [recentViews] = await pool.query(
      `SELECT COUNT(*) as count FROM view_logs 
       WHERE started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    res.json({
      success: true,
      data: {
        totalMovies: totalMovies[0].total,
        totalSize: totalSize[0].total || 0,
        genres: genreStats,
        recentViews: recentViews[0].count,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// PUT /api/v1/admin/movies/:id - Update movie metadata
router.put('/movies/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, synopsis, rating, featured } = req.body;

    await pool.query(
      `UPDATE movies SET 
        title = COALESCE(?, title),
        synopsis = COALESCE(?, synopsis),
        rating = COALESCE(?, rating),
        featured = COALESCE(?, featured),
        updated_at = NOW()
       WHERE id = ?`,
      [title, synopsis, rating, featured, id]
    );

    res.json({ success: true, message: 'Movie updated' });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// DELETE /api/v1/admin/movies/:id - Soft delete movie
router.delete('/movies/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE movies SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: 'Movie deactivated' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// POST /api/v1/admin/featured/:id - Toggle featured status
router.post('/featured/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE movies SET featured = NOT featured, updated_at = NOW() WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: 'Featured status toggled' });
  } catch (error) {
    console.error('Error toggling featured:', error);
    res.status(500).json({ error: 'Failed to toggle featured' });
  }
});

module.exports = router;
