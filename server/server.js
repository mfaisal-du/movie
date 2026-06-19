require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

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

// Serve static files for cached posters/backdrops
app.use('/posters', express.static(path.join(__dirname, 'public/posters')));
app.use('/backdrops', express.static(path.join(__dirname, 'public/backdrops')));

// Rate limiting (disabled in development, or use higher limit)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 5000,
  message: { error: 'Too many requests' },
});
app.use('/api/', limiter);

// Import routes
const movieRoutes = require('./src/routes/movies');
const streamRoutes = require('./src/routes/stream');
const imageRoutes = require('./src/routes/images');
const adminRoutes = require('./src/routes/admin');
const genreRoutes = require('./src/routes/genres');
const systemRoutes = require('./src/routes/system');
const subtitleRoutes = require('./src/routes/subtitles');

// Register routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/stream', streamRoutes);
app.use('/api/v1/image', imageRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1', systemRoutes);
app.use('/api/v1/subtitles', subtitleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MovieCloud API running on port ${PORT}`);
  // Start auto-sync watcher
  const { startWatcher } = require('./src/services/watcher');
  startWatcher();
});

module.exports = app;