const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/v1/genres - Get all genres with movie counts
router.get('/', async (req, res) => {
  try {
    const [genres] = await pool.query(
      `SELECT g.*, COUNT(DISTINCT mg.movie_id) as movie_count
       FROM genres g
       LEFT JOIN movie_genres mg ON g.id = mg.genre_id
       LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
       GROUP BY g.id
       ORDER BY movie_count DESC`
    );

    res.json({ success: true, data: { genres } });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

module.exports = router;
