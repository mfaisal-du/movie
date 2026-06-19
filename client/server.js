process.env.NODE_ENV = 'production';

const { createServer } = require('http');
const next = require('next');

const dev = false;
const port = parseInt(process.env.PORT || '3000', 10);

console.log('> Starting Next.js production server...');
console.log('> NODE_ENV:', process.env.NODE_ENV);
console.log('> PORT:', port);
console.log('> DB_HOST:', process.env.DB_HOST || 'not set');

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('> Next.js ready, creating HTTP server...');
  
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, '0.0.0.0', (err) => {
    if (err) {
      console.error('> Server error:', err);
      throw err;
    }
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
}).catch((err) => {
  console.error('> Failed to start Next.js:', err);
  process.exit(1);
});
