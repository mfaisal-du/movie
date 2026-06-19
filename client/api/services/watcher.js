/**
 * Auto-sync service for MovieCloud
 * Watches WD Cloud directory for new movies and automatically syncs them
 */

const fs = require('fs');
const path = require('path');
const { scanLibrary } = require('./scanner');

const WD_CLOUD_HOST = process.env.WD_CLOUD_HOST || '10.65.1.150';
const WD_CLOUD_SHARE = process.env.WD_CLOUD_SHARE || 'trailermaster786';
const WD_MOVIES_PATH = process.env.WD_CLOUD_MOVIES_PATH || 'Movies 2026';
const WD_MOUNT_POINT = process.env.WD_MOUNT_POINT || `\\\\${WD_CLOUD_HOST}\\${WD_CLOUD_SHARE}`;
const SCAN_INTERVAL = parseInt(process.env.SCAN_INTERVAL_MINUTES || '5') * 60 * 1000;

let scanInterval = null;
let lastScan = 0;

async function incrementalScan() {
  const now = Date.now();
  if (now - lastScan < SCAN_INTERVAL) {
    return; // Skip if scan was recent
  }
  lastScan = now;
  
  try {
    console.log('Running incremental scan...');
    await scanLibrary('incremental');
    console.log('Incremental scan complete');
  } catch (error) {
    console.error('Incremental scan failed:', error);
  }
}

function startWatcher() {
  // Run initial scan
  scanLibrary('full').catch(console.error);
  
  // Set up periodic scans
  scanInterval = setInterval(incrementalScan, SCAN_INTERVAL);
  
  console.log(`Auto-sync started. Scanning every ${SCAN_INTERVAL / 60000} minutes.`);
}

function stopWatcher() {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  console.log('Auto-sync stopped.');
}

module.exports = {
  startWatcher,
  stopWatcher,
  incrementalScan,
};