#!/bin/bash

# MovieCloud Deployment Script

echo "Building MovieCloud for production..."

# Build client
cd client
npm run build
cd ..

# Install PM2 globally if not installed
npm install -g pm2 2>/dev/null || true

# Start applications with PM2
pm2 start ecosystem.config.js

echo "Starting Cloudflare Tunnel..."
pm2 start ecosystem.config.js --only cloudflared-tunnel 2>/dev/null || \
  cloudflared tunnel --config cloudflared-config.yml run --url http://localhost:3000

echo "MovieCloud deployed successfully!"
pm2 status