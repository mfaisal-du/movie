/**
 * MovieCloud Production Server
 * Serves both Next.js frontend and Express API on same port
 * Works on Hostinger Cloud and locally
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;

// Security middleware
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
}));

// Performance middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Serve static files for cached posters/backdrops
app.use('/posters', express.static(path.join(__dirname, 'public/posters')));
app.use('/backdrops', express.static(path.join(__dirname, 'public/backdrops')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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

// Register API routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/stream', streamRoutes);
app.use('/api/v1/image', imageRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1', systemRoutes);
app.use('/api/v1/subtitles', subtitleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: require('./src/services/wdcloud').isRemoteMode() ? 'remote' : 'local',
  });
});

// In production, serve Next.js
if (process.env.NODE_ENV === 'production') {
  const next = require('next');
  const nextApp = next({ 
    dev: false, 
    dir: path.join(__dirname, '..', 'client'),
  });
  const nextHandle = nextApp.getRequestHandler();

  nextApp.prepare().then(() => {
    // Serve Next.js pages for all non-API routes
    app.all('*', (req, res) => {
      return nextHandle(req, res);
    });

    app.listen(PORT, () => {
      console.log(`MovieCloud production server running on port ${PORT}`);
      console.log(`Mode: ${require('./src/services/wdcloud').isRemoteMode() ? 'remote (WD Cloud API)' : 'local (SMB)'}`);
      
      // Start auto-sync watcher
      const { startWatcher } = require('./src/services/watcher');
      startWatcher();
    });
  });
} else {
  // Development: API only (Next.js runs separately)
  app.use((req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  app.listen(PORT, () => {
    console.log(`MovieCloud API running on port ${PORT}`);
    console.log(`Mode: ${require('./src/services/wdcloud').isRemoteMode() ? 'remote (WD Cloud API)' : 'local (SMB)'}`);
    
    const { startWatcher } = require('./src/services/watcher');
    startWatcher();
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
