require('dotenv').config({ path: '../.env' });
const { scanLibrary } = require('./src/services/scanner');

async function run() {
  console.log('Starting library scan...');
  try {
    const result = await scanLibrary('full');
    console.log('Scan complete!', result);
  } catch (error) {
    console.error('Scan failed:', error);
  }
  process.exit(0);
}

run();
