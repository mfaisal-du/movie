const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/v1/health - Health check
router.get('/health', async (req, res) => {
  try {
    // Test MySQL connection
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mysql: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        mysql: 'disconnected',
      },
      error: error.message,
    });
  }
});

// GET /api/v1/stats - Public stats
router.get('/stats', async (req, res) => {
  try {
    const [totalMovies] = await pool.query(
      'SELECT COUNT(*) as total FROM movies WHERE is_active = 1'
    );
    
    const [genreStats] = await pool.query(
      `SELECT g.name, g.slug, COUNT(DISTINCT mg.movie_id) as count
       FROM genres g
       LEFT JOIN movie_genres mg ON g.id = mg.genre_id
       LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
       GROUP BY g.id
       ORDER BY count DESC`
    );

    res.json({
      success: true,
      data: {
        totalMovies: totalMovies[0].total,
        genres: genreStats,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
