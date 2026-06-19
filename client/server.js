/**
 * MovieCloud Production Server (Self-contained)
 * Runs inside client/ folder for Hostinger deployment
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
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization', 'Range'], exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'] }));
app.use(compression());
if (process.env.NODE_ENV !== 'test') { app.use(morgan('combined')); }
app.use(express.json({ limit: '10mb' }));

const movieRoutes = require('./api/routes/movies');
const streamRoutes = require('./api/routes/stream');
const imageRoutes = require('./api/routes/images');
const adminRoutes = require('./api/routes/admin');
const genreRoutes = require('./api/routes/genres');
const systemRoutes = require('./api/routes/system');
const subtitleRoutes = require('./api/routes/subtitles');

app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/stream', streamRoutes);
app.use('/api/v1/image', imageRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1', systemRoutes);
app.use('/api/v1/subtitles', subtitleRoutes);

app.get('/api/health', (req, res) => {
  const wdcloud = require('./api/services/wdcloud');
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: wdcloud.isRemoteMode() ? 'remote' : 'local' });
});

const next = require('next');
const nextApp = next({ dev: false, dir: __dirname });
const nextHandle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  app.all('*', (req, res) => { return nextHandle(req, res); });
  app.listen(PORT, '0.0.0.0', () => {
    console.log('MovieCloud running on port ' + PORT);
    const { startWatcher } = require('./api/services/watcher');
    startWatcher();
  });
});

app.use((err, req, res, next) => { console.error('Server error:', err); res.status(500).json({ error: 'Internal server error' }); });
module.exports = app;
