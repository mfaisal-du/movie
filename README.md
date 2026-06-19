# MovieCloud - Movie Streaming Platform

A Netflix-like movie streaming platform with dark cinematic UI, built with Next.js 14 and Express.js.

## Features

- **Cinematic UI** with glass morphism, particles, and Framer Motion animations
- **Movie streaming** from WD Cloud NAS (local SMB or remote REST API)
- **TMDB integration** for movie metadata, posters, and backdrops
- **Search** with debounced API calls and genre filtering
- **Continue Watching** with watch progress tracking
- **Responsive design** for mobile, tablet, and desktop
- **Admin panel** for library scanning and management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Express.js, Node.js |
| Database | MySQL (XAMPP local or Hostinger Cloud) |
| Storage | WD Cloud NAS (SMB local or REST API remote) |
| Metadata | TMDB API |

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- XAMPP (MySQL)
- WD Cloud NAS on local network

### Setup

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Create database
mysql -u root -e "CREATE DATABASE moviecloud"
mysql -u root moviecloud < database/moviecloud_export.sql

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm run dev
```

Visit `http://localhost:3000`

## Deployment to Hostinger

### Step 1: Export Database
```bash
# Run the export script
export-database.bat
```

### Step 2: Import to Hostinger
1. Login to Hostinger hPanel
2. Go to **Databases** → **phpMyAdmin**
3. Select your database
4. Click **Import** → Upload `database/moviecloud_export.sql`
5. Click **Go**

### Step 3: Deploy to Hostinger
1. Go to **Websites** → **Add Website** → **Node.js App**
2. Connect your GitHub repository
3. Set environment variables (use `.env.hostinger` as reference)
4. Set start command: `node server/index.js`
5. Assign your domain

### Environment Variables

```env
# WD Cloud (Remote API)
WD_CLOUD_EMAIL=your_wd_email
WD_CLOUD_PASSWORD=your_wd_password

# MySQL (Hostinger)
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_mysql_database

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## Project Structure

```
moviecloud/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── stores/      # Zustand stores
│   │   └── styles/      # Global CSS
│   └── public/          # Static assets
├── server/              # Express.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── db/          # Database connection
│   └── index.js         # Production entry
├── database/            # SQL exports
└── .env.hostinger       # Production config
```

## How It Works

### Movie Streaming
- **Local mode**: Streams directly from WD Cloud NAS via SMB
- **Remote mode**: Streams via WD Cloud REST API (for Hostinger deployment)

### Auto-Sync
The watcher service scans your WD Cloud NAS every 30 minutes. When you add a new movie:
1. Movie file is detected on NAS
2. Filename is parsed for title, year, quality
3. TMDB API enriches metadata (poster, synopsis, rating)
4. Movie appears in the database and online

## License

Private - All rights reserved.
