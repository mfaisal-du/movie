const mysql = require('mysql2/promise');

async function startServer() {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const compression = require('compression');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');

  const app = express();
  const PORT = process.env.API_PORT || 3001;

  // Security middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Performance middleware
  app.use(compression());

  // Logging
  app.use(morgan('dev'));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests' },
  });
  app.use('/api/', limiter);

  // Health check
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Featured movies endpoint
  app.get('/api/v1/movies/featured', async (req, res) => {
    try {
      const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'moviecloud',
        port: 3306
      });
      
      const [movies] = await pool.execute(`
        SELECT m.id, m.title, m.year, m.duration, m.synopsis, m.rating, 
               m.poster_url, m.backdrop_url, m.trailer_url, m.quality, m.view_count
        FROM movies m
        WHERE m.is_active = 1 AND m.featured = 1
        ORDER BY RAND()
        LIMIT 5
      `);
      
      console.log('Featured movies query result:', movies.length, 'movies');
      
      res.json({ success: true, data: { movies } });
      await pool.end();
    } catch (error) {
      console.error('Error fetching featured movies:', error);
      res.status(500).json({ error: 'Failed to fetch featured movies' });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`MovieCloud API running on port ${PORT}`);
    console.log('Server is ready to accept connections');
  });
}

startServer();