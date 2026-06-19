# Implementation Plan
## MovieCloud — Step-by-Step Build Guide for OpenCode Agent

---

## Overview

This document provides a **sequential, task-by-task implementation plan** for building the MovieCloud streaming platform. Each task includes clear acceptance criteria, file locations, and dependencies. The OpenCode agent should execute these tasks **in order**, as later tasks depend on earlier ones.

**Total estimated tasks:** 47
**Total estimated time:** 4-6 weeks (MVP Phase 1)

---

## Phase 0: Project Setup & Infrastructure (Tasks 1-8)

### Task 1: Initialize Project Structure
**Priority:** Critical | **Depends on:** None

**Instructions:**
Create the project directory structure:

```
moviecloud/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Base UI components
│   │   │   ├── layout/       # Header, Footer, Nav
│   │   │   ├── movie/        # MovieCard, MovieRow, etc.
│   │   │   ├── player/       # VideoPlayer, controls
│   │   │   └── admin/        # Admin components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities, API client, helpers
│   │   ├── stores/           # Zustand stores
│   │   ├── styles/           # Global CSS, Tailwind config
│   │   └── types/            # TypeScript interfaces
│   ├── public/
│   │   ├── posters/          # Cached movie posters
│   │   ├── backdrops/        # Cached movie backdrops
│   │   └── images/           # Static images, icons
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/        # Auth, rate limiting, CORS
│   │   ├── services/         # Business logic
│   │   │   ├── tmdb.js       # TMDB API integration
│   │   │   ├── scanner.js    # WD Cloud file scanner
│   │   │   ├── streamer.js   # Video stream proxy
│   │   │   └── parser.js     # Filename parser
│   │   ├── db/               # MySQL connection + queries
│   │   │   ├── connection.js
│   │   │   ├── migrations/
│   │   │   └── queries/
│   │   └── utils/            # Helpers, logger
│   ├── package.json
│   └── server.js             # Entry point
├── database/
│   └── migrations/           # SQL migration files
├── .env.example
├── .gitignore
└── README.md
```

**Acceptance Criteria:**
- [ ] All directories exist
- [ ] `.gitignore` includes node_modules, .env, /public/posters/*, /public/backdrops/*

---

### Task 2: Initialize Frontend (Next.js)
**Priority:** Critical | **Depends on:** Task 1

**Commands:**
```bash
cd client
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install framer-motion zustand react-icons lucide-react
npm install -D @types/node
```

**Acceptance Criteria:**
- [ ] `npm run dev` starts on port 3000
- [ ] Default Next.js page loads at http://localhost:3000
- [ ] Tailwind CSS works (test with `className="text-red-500"`)

---

### Task 3: Initialize Backend (Express)
**Priority:** Critical | **Depends on:** Task 1

**Commands:**
```bash
cd server
npm init -y
npm install express cors helmet compression morgan mysql2 sharp dotenv
npm install -D nodemon
```

Create basic `server.js`:
```javascript
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MovieCloud API running on port ${PORT}`);
});
```

**Acceptance Criteria:**
- [ ] `node server.js` starts on port 3001
- [ ] GET http://localhost:3001/api/v1/health returns `{ "status": "ok" }`

---

### Task 4: Create .env Configuration
**Priority:** Critical | **Depends on:** Task 1

Create `.env.example` (and `.env` with real values) in project root:

```env
# === WD Cloud (SMB/CIFS) ===
WD_CLOUD_HOST=10.65.1.150
WD_CLOUD_SHARE=trailermaster786
WD_CLOUD_USERNAME=your_email@gmail.com
WD_CLOUD_PASSWORD=your_password
WD_CLOUD_MOVIES_PATH=Movies 2026
WD_MOUNT_POINT=/mnt/wdcloud

# === WD Cloud (WebDAV - Alternative) ===
WD_WEBDAV_URL=https://your-device.wdmycloud.com/webdav
WD_WEBDAV_USERNAME=your_email@gmail.com
WD_WEBDAV_PASSWORD=your_password

# === MySQL (XAMPP) ===
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=moviecloud

# === TMDB API ===
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# === App Config ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
API_PORT=3001
ADMIN_PASSWORD=changeme
STREAM_CHUNK_SIZE=1048576
```

**Acceptance Criteria:**
- [ ] `.env` file exists with all keys
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with placeholder values (committed to git)

---

### Task 5: Setup MySQL Database
**Priority:** Critical | **Depends on:** Task 1

**Instructions:**
1. Ensure XAMPP MySQL is running on port 3306
2. Create the database and all tables using `Schema.md`
3. Run the SQL from Schema.md sections 3.1-3.7, 4.1-4.2, 5.1-5.3, 6.1-6.3

**Commands:**
```bash
# Via MySQL CLI
mysql -u root -e "CREATE DATABASE IF NOT EXISTS moviecloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root moviecloud < database/migrations/001_initial_schema.sql

# Or via XAMPP phpMyAdmin at http://localhost/phpmyadmin
```

**Acceptance Criteria:**
- [ ] Database `moviecloud` exists
- [ ] All 7 tables exist: movies, genres, movie_genres, scan_logs, tmdb_cache, view_logs, app_settings
- [ ] All 3 views exist: v_movie_genres, v_movie_stats, v_popular_movies
- [ ] Genres are seeded (8 rows)
- [ ] App settings are seeded (14 rows)

---

### Task 6: Setup MySQL Connection in Backend
**Priority:** Critical | **Depends on:** Task 3, Task 5

Create `server/src/db/connection.js`:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moviecloud',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
```

**Acceptance Criteria:**
- [ ] Backend starts and logs "MySQL connected successfully"
- [ ] A simple query works: `SELECT COUNT(*) FROM movies`

---

### Task 7: Mount WD Cloud (SMB)
**Priority:** Critical | **Depends on:** Task 4

**Linux:**
```bash
# Create mount point
sudo mkdir -p /mnt/wdcloud

# Test mount
sudo mount -t cifs //10.65.1.150/trailermaster786 /mnt/wdcloud \
  -o username=trailermaster786@gmail.com,password=Inotknow@786,vers=3.0,iocharset=utf8

# Verify
ls /mnt/wdcloud/
# Should show: "Movies 2026" folder

# Make permanent (add to /etc/fstab)
//10.65.1.150/trailermaster786 /mnt/wdcloud cifs username=trailermaster786@gmail.com,password=Inotknow@786,vers=3.0,iocharset=utf8,_netdev,nofail 0 0
```

**Windows:**
```
# Already mapped as network drive, note the drive letter
# e.g., Z:\trailermaster786\Movies 2026
```

**Acceptance Criteria:**
- [ ] `ls /mnt/wdcloud/Movies 2026/` (or Windows equivalent) shows genre folders
- [ ] At least one movie file is visible inside a genre folder

---

### Task 8: Configure Next.js to Proxy API to Backend
**Priority:** High | **Depends on:** Task 2, Task 3

Update `client/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
};

module.exports = nextConfig;
```

**Acceptance Criteria:**
- [ ] Frontend at http://localhost:3000/api/v1/health returns the backend health response
- [ ] No CORS errors in browser console

---

## Phase 1: Core Backend Services (Tasks 9-18)

### Task 9: Build Filename Parser
**Priority:** Critical | **Depends on:** Task 6

Create `server/src/services/parser.js`.

Parse filenames like:
```
Anora 2024 Dual Audio Hindi (ORG 5.1) 1080p WEB-DL x264 ESubs.mkv
2 Guns 2013 1080p BluRay x264
The Dark Knight 2008 720p BRRip x264
```

**Extract:**
- `title` (clean, no year/quality/etc.)
- `year` (4-digit number)
- `quality` ("720p", "1080p", "4K")
- `audioInfo` (audio description if present)
- `hasSubtitles` (true if ESubs, Subs, Subbed found)
- `source` (WEB-DL, BluRay, BRRip, etc.)
- `codec` (x264, x265, HEVC, etc.)
- `slug` (for DB ID: "anora-2024", "2-guns-2013")

**Supported formats:** .mkv, .mp4, .avi, .wmv, .mov

**Acceptance Criteria:**
- [ ] Parses 10+ sample filenames correctly
- [ ] Handles edge cases: multiple years in title, no year, special characters
- [ ] Generates unique, URL-safe slugs
- [ ] Returns null/undefined for non-video files

---

### Task 10: Build TMDB Service
**Priority:** Critical | **Depends on:** Task 6

Create `server/src/services/tmdb.js`.

**Functions:**
- `searchMovie(title, year)` — Search TMDB, check cache first
- `getMovieDetails(tmdbId)` — Get full details + credits + videos
- `downloadAndCachePoster(posterPath, movieSlug)` — Download from TMDB, save locally
- `downloadAndCacheBackdrop(backdropPath, movieSlug)` — Same for backdrops
- `enrichMovie(parsedFilename)` — Full pipeline: parse → search → fetch → cache → return enriched data

**Rate Limiting:**
- Max 40 requests per 10 seconds (TMDB limit)
- Implement a simple queue with setTimeout between requests
- Log all API calls for debugging

**Acceptance Criteria:**
- [ ] Searching for "Anora 2024" returns TMDB results
- [ ] Poster is downloaded to `/public/posters/anora-2024.jpg`
- [ ] Cache prevents duplicate API calls
- [ ] Rate limiting is respected (no 429 errors during normal scan)

---

### Task 11: Build WD Cloud Scanner Service
**Priority:** Critical | **Depends on:** Task 7, Task 9, Task 10

Create `server/src/services/scanner.js`.

**Functions:**
- `scanLibrary(type='full')` — Main scan function
  - Read all genre folders from WD Cloud mount
  - For each video file: parse filename, check DB, enrich via TMDB
  - Create/Update movie records
  - Log scan results
- `getDirectoryListing(path)` — List files in a WD Cloud directory
- `getFileInfo(path)` — Get file size, stat

**Scan Logic:**
1. Read `WD_MOUNT_POINT/Movies 2026/`
2. List subdirectories (genre folders)
3. For each genre folder, list all files
4. Filter for video extensions: .mkv, .mp4, .avi, .wmv, .mov
5. For each video file: run filename parser
6. Check if movie exists in DB (by slug)
7. If new: enrich via TMDB, insert into DB
8. If exists: check file hash, update if changed
9. Mark missing movies as `is_active=0`

**Acceptance Criteria:**
- [ ] Scan discovers all movies from WD Cloud
- [ ] New movies are inserted with TMDB metadata
- [ ] Existing movies are updated if file changed
- [ ] Scan log is recorded in database
- [ ] Scanning is non-blocking (async)

---

### Task 12: Build Movie API Routes
**Priority:** Critical | **Depends on:** Task 6, Task 11

Create `server/src/routes/movies.js`.

**Endpoints:**
- `GET /api/v1/movies` — List with pagination, filter, sort
  - Query params: `page`, `limit`, `genre`, `sort` (title, year, rating, added_at, view_count), `order` (asc, desc)
- `GET /api/v1/movies/featured` — 5 featured movies
- `GET /api/v1/movies/genre/:slug` — Movies by genre
- `GET /api/v1/movies/search?q=` — Search by title (LIKE + FULLTEXT)
- `GET /api/v1/movies/recent` — Last 20 added
- `GET /api/v1/movies/popular` — Top 20 by views
- `GET /api/v1/movies/:id` — Single movie detail
- `GET /api/v1/movies/:id/similar` — Same-genre movies (limit 12)

**Acceptance Criteria:**
- [ ] All endpoints return correct JSON format
- [ ] Pagination works (page, limit, total, totalPages)
- [ ] Genre filtering works
- [ ] Search returns relevant results
- [ ] 404 returned for non-existent movie ID

---

### Task 13: Build Stream Proxy Route
**Priority:** Critical | **Depends on:** Task 7, Task 12

Create `server/src/routes/stream.js`.

**Endpoint:** `GET /api/v1/stream/:id`

**Logic:**
1. Look up movie ID in DB → get `file_path`
2. Construct full path: `WD_MOUNT_POINT + '/' + file_path`
3. Check file exists with `fs.existsSync()`
4. Get file stats with `fs.statSync()`
5. Parse `Range` header from request
6. If Range: return 206 with chunked stream
7. If no Range: return 200 with full stream
8. Pipe file read stream to response

**Also add:**
- `HEAD /api/v1/stream/:id` — Return file info without body
- `GET /api/v1/stream/:id/subtitle` — Serve .srt/.vtt if exists alongside movie

**Acceptance Criteria:**
- [ ] Video plays in browser when accessing stream URL
- [ ] Seeking works (sends Range requests, 206 responses)
- [ ] Content-Type is set correctly based on extension
- [ ] Non-existent movie returns 404
- [ ] File not found on WD Cloud returns 503

---

### Task 14: Build Image Proxy Route
**Priority:** High | **Depends on:** Task 10

Create `server/src/routes/images.js`.

**Endpoints:**
- `GET /api/v1/image/poster/:id` — Serve cached poster or fetch from TMDB
- `GET /api/v1/image/backdrop/:id` — Same for backdrops

**Logic:**
1. Check local cache: `/public/posters/{id}.webp`
2. If cached: serve with `Cache-Control: public, max-age=604800` (7 days)
3. If not cached: look up movie in DB, get TMDB poster_path
4. Download from TMDB, resize with Sharp, save as WebP
5. Serve the newly cached image

**Acceptance Criteria:**
- [ ] Cached posters are served instantly
- [ ] Uncached posters are fetched, resized, cached, and served
- [ ] Proper Cache-Control headers are set
- [ ] 404 for movies with no poster (fallback to placeholder)

---

### Task 15: Build Admin Routes
**Priority:** High | **Depends on:** Task 11, Task 12

Create `server/src/routes/admin.js`.

**Endpoints:**
- `POST /api/v1/admin/scan` — Trigger library scan
- `PUT /api/v1/admin/movies/:id` — Update movie metadata
- `DELETE /api/v1/admin/movies/:id` — Soft delete (is_active=0)
- `POST /api/v1/admin/movies/:id/refresh` — Re-fetch TMDB data
- `GET /api/v1/admin/stats` — Dashboard statistics
- `POST /api/v1/admin/featured/:id` — Toggle featured status

**Middleware:** Simple password check from .env `ADMIN_PASSWORD`

**Acceptance Criteria:**
- [ ] Admin endpoints require correct password (via `Authorization` header or query param)
- [ ] Scan triggers successfully and returns scan ID
- [ ] Stats return: total movies, per-genre counts, storage size, recent activity
- [ ] Unauthorized requests return 401

---

### Task 16: Build Genre & System Routes
**Priority:** Medium | **Depends on:** Task 6, Task 12

Create `server/src/routes/genres.js` and `server/src/routes/system.js`.

**Endpoints:**
- `GET /api/v1/genres` — All genres with movie counts
- `GET /api/v1/health` — DB + WD Cloud connectivity check
- `GET /api/v1/stats` — Public stats (total movies, newest, etc.)

**Acceptance Criteria:**
- [ ] Genres endpoint returns all 8 genres with counts
- [ ] Health check verifies MySQL connection and WD Cloud mount

---

### Task 17: Build View Logging
**Priority:** Medium | **Depends on:** Task 12

Add view tracking to stream route:
- When stream is first requested, log a view event
- Increment `view_count` on the movie
- Create `view_logs` entry

Also create: `POST /api/v1/movies/:id/progress` — Save playback progress (for cross-device sync, future use)

**Acceptance Criteria:**
- [ ] Streaming a movie increments its view_count
- [ ] view_logs table gets a new row per stream session

---

### Task 18: Wire All Routes in Express App
**Priority:** Critical | **Depends on:** Tasks 12-17

Update `server/server.js` to register all routes:

```javascript
const movieRoutes = require('./src/routes/movies');
const streamRoutes = require('./src/routes/stream');
const imageRoutes = require('./src/routes/images');
const adminRoutes = require('./src/routes/admin');
const genreRoutes = require('./src/routes/genres');
const systemRoutes = require('./src/routes/system');

app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/stream', streamRoutes);
app.use('/api/v1/image', imageRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1', systemRoutes);
```

Add error handler middleware, 404 handler, and rate limiting.

**Acceptance Criteria:**
- [ ] All API endpoints are accessible
- [ ] 404 returned for undefined routes
- [ ] Error handler returns consistent JSON error format
- [ ] Rate limiting works (test with rapid requests)

---

## Phase 2: Frontend — Layout & Components (Tasks 19-30)

### Task 19: Setup Global Styles & Design Tokens
**Priority:** High | **Depends on:** Task 2

**Files:** `client/src/styles/globals.css`, `client/tailwind.config.ts`

- Configure all design tokens from `UI_UX.md` as CSS custom properties
- Map Tailwind colors to use CSS variables
- Setup Inter font (Google Fonts import)
- Add dark background default (`bg-[#141414]` on body)
- Configure Tailwind `extend` for custom spacing, sizes, animations

**Acceptance Criteria:**
- [ ] Background is #141414
- [ ] Text is white by default
- [ ] Inter font is loaded and applied
- [ ] Custom colors like `bg-brand`, `text-accent-gold` work

---

### Task 20: Build Header Component
**Priority:** High | **Depends on:** Task 19

**Files:** `client/src/components/layout/Header.tsx`

- Logo: "MovieCloud" with red "Cloud"
- Navigation links: Home, Genre (dropdown), My List
- Search bar (always visible)
- Mobile: hamburger menu
- Transparent on top, solid on scroll (use `useEffect` + scroll listener)
- Sticky position, z-200

**Acceptance Criteria:**
- [ ] Header renders at top of all pages
- [ ] Background transitions from transparent to solid on scroll
- [ ] Mobile hamburger opens nav drawer
- [ ] All nav links navigate correctly

---

### Task 21: Build Mobile Navigation Components
**Priority:** Medium | **Depends on:** Task 20

**Files:**
- `client/src/components/layout/MobileNavDrawer.tsx` — Slide-out from left
- `client/src/components/layout/MobileBottomNav.tsx` — Fixed bottom tabs

**Acceptance Criteria:**
- [ ] Hamburger opens drawer with smooth slide animation
- [ ] Bottom nav shows on mobile with Home, Movies, My List tabs
- [ ] Active tab is highlighted in red
- [ ] Drawer closes on link click or overlay tap

---

### Task 22: Build API Client & Hooks
**Priority:** High | **Depends on:** Task 8

**Files:**
- `client/src/lib/api.ts` — Fetch wrapper with error handling
- `client/src/hooks/useMovies.ts` — Fetch movie lists
- `client/src/hooks/useMovie.ts` — Fetch single movie
- `client/src/hooks/useSearch.ts` — Debounced search
- `client/src/hooks/useGenres.ts` — Fetch genres

**API Client Pattern:**
```typescript
const api = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }
};
```

**Acceptance Criteria:**
- [ ] API client handles errors gracefully
- [ ] useMovies fetches from /api/v1/movies with params
- [ ] useSearch debounces at 300ms

---

### Task 23: Build Zustand Stores
**Priority:** Medium | **Depends on:** Task 22

**Files:** `client/src/stores/`

- `movieStore.ts` — Server state (movies, featured, genres)
- `uiStore.ts` — UI state (search open, mobile menu, header scrolled)
- `localStorageStore.ts` — Persistent state (myList, watchProgress, recentSearches)

**Acceptance Criteria:**
- [ ] My List persists across page reloads (localStorage)
- [ ] Watch progress is saved/loaded from localStorage
- [ ] UI state resets appropriately on navigation

---

### Task 24: Build Movie Card Component
**Priority:** Critical | **Depends on:** Task 19, Task 22

**File:** `client/src/components/movie/MovieCard.tsx`

- Poster image with 2:3 aspect ratio
- Lazy loading with IntersectionObserver
- Skeleton loading state
- Hover state: scale 1.08, lift, show info + buttons (desktop)
- Tap → bottom sheet (mobile)
- Fallback gradient poster for missing images

**Acceptance Criteria:**
- [ ] Card displays poster with correct aspect ratio
- [ ] Hover animation is smooth (Framer Motion)
- [ ] "Play", "Info", "My List" buttons work on hover
- [ ] Skeleton shows while poster loads
- [ ] Fallback shows for movies without posters

---

### Task 25: Build Movie Row Component (Horizontal Scroll)
**Priority:** Critical | **Depends on:** Task 24

**File:** `client/src/components/movie/MovieRow.tsx`

- Section title with "See All >" link
- Horizontal scrollable container
- Mouse drag support (desktop)
- Left/right arrow buttons (desktop, show on hover)
- Touch scroll (native, mobile)
- Smooth scroll behavior

**Acceptance Criteria:**
- [ ] Row scrolls horizontally with mouse drag
- [ ] Arrow buttons scroll by 3 cards per click
- [ ] Touch scroll works on mobile
- [ ] "See All" links to /genre/[slug]

---

### Task 26: Build Hero Banner Component
**Priority:** Critical | **Depends on:** Task 22

**File:** `client/src/components/movie/HeroBanner.tsx`

- Full-width backdrop with gradient overlay
- Auto-rotates every 8 seconds (5 featured movies)
- Pauses on hover
- Title, rating, year, genres, duration displayed
- Synopsis text
- "Play Now" and "More Info" buttons
- Crossfade transition (1s)
- Carousel indicator dots (bottom-left)

**Acceptance Criteria:**
- [ ] Hero shows featured movies with backdrop images
- [ ] Auto-rotation works (8s interval)
- [ ] Hover pauses rotation
- [ ] Clicking "Play Now" navigates to /watch/[id]
- [ ] Crossfade animation is smooth

---

### Task 27: Build Search Component
**Priority:** High | **Depends on:** Task 22, Task 24

**Files:**
- `client/src/components/layout/SearchBar.tsx` — Input in header
- `client/src/components/layout/SearchDropdown.tsx` — Results dropdown
- `client/src/app/search/page.tsx` — Full results page

**Acceptance Criteria:**
- [ ] Typing shows dropdown with 6 results after 300ms
- [ ] Keyboard navigation works (arrows + enter)
- [ ] Clicking a result navigates to movie detail
- [ ] Pressing Enter goes to full search page
- [ ] Recent searches are saved to localStorage
- [ ] Empty state shows for no results

---

### Task 28: Build Homepage
**Priority:** Critical | **Depends on:** Tasks 25, 26

**File:** `client/src/app/page.tsx`

- Hero banner at top
- "Continue Watching" row (if any in-progress movies)
- Genre rows: Action, Comedy, Drama, Horror, Sci-Fi, Thriller, Animation, Other
- "Recently Added" row
- "Most Popular" row
- All rows fetched in parallel on page load
- Skeleton loading while data loads

**Acceptance Criteria:**
- [ ] Homepage renders with hero + all genre rows
- [ ] Skeleton loaders show during fetch
- [ ] Continue Watching row appears when there's saved progress
- [ ] Page loads in < 3 seconds

---

### Task 29: Build Movie Detail Page
**Priority:** High | **Depends on:** Tasks 24, 25

**File:** `client/src/app/movie/[id]/page.tsx`

- Full-width backdrop (50vh) with gradient
- Poster overlapping backdrop
- Title, year, rating, genres, duration
- Synopsis
- Cast & director
- Technical info (quality, audio, subtitles, file size)
- "Play Now" button (large, red)
- "My List" toggle button
- "Share" button (copies URL to clipboard)
- "Similar Movies" row
- Back button (mobile)

**Acceptance Criteria:**
- [ ] All movie details display correctly
- [ ] "Play Now" navigates to /watch/[id]
- [ ] "My List" toggles and persists
- [ ] Share copies URL and shows toast notification
- [ ] Similar movies row shows related content
- [ ] 404 page for invalid movie IDs

---

### Task 30: Build Genre Page
**Priority:** High | **Depends on:** Task 24

**File:** `client/src/app/genre/[slug]/page.tsx`

- Genre title + movie count header
- Sort dropdown (Recently Added, Title A-Z, Rating, Year)
- Responsive grid of movie cards
- Infinite scroll (load 20 at a time)
- Empty state if no movies in genre

**Acceptance Criteria:**
- [ ] Genre page shows movies filtered by genre
- [ ] Sort changes order correctly
- [ ] Infinite scroll loads more movies
- [ ] Grid is responsive (2-8 columns)

---

## Phase 3: Video Player (Tasks 31-35)

### Task 31: Integrate Video.js
**Priority:** Critical | **Depends on:** Task 13

**Commands:**
```bash
cd client
npm install video.js @types/video.js
```

**File:** `client/src/components/player/VideoPlayer.tsx`

- Initialize Video.js with HTML5 tech
- Set source to `/api/v1/stream/[movieId]`
- Custom skin: dark theme matching MovieCloud design
- All standard controls: play/pause, volume, progress, fullscreen, speed

**Acceptance Criteria:**
- [ ] Video.js initializes and plays a movie stream
- [ ] Controls are styled dark to match theme
- [ ] Player is responsive (full viewport on mobile)

---

### Task 32: Implement Player Features
**Priority:** High | **Depends on:** Task 31

**Features to add:**
- Resume playback from localStorage
- Save progress every 10 seconds
- Keyboard shortcuts (Space, arrows, F, M, Esc)
- Double-click for fullscreen
- Picture-in-Picture button
- Auto-hide controls after 3s inactivity
- Playback speed selector (0.5x to 2x)

**Acceptance Criteria:**
- [ ] Pausing and returning later resumes from saved position
- [ ] Keyboard shortcuts all work
- [ ] Controls auto-hide during playback
- [ ] Speed can be changed

---

### Task 33: Build Watch Page
**Priority:** High | **Depends on:** Task 31

**File:** `client/src/app/watch/[id]/page.tsx`

- Full-viewport video player
- Movie title at top (fades out on play)
- Back button (returns to movie detail)
- Error overlay if stream fails (with retry button)
- Loading state while stream buffers

**Acceptance Criteria:**
- [ ] Navigating to /watch/[id] starts playing immediately
- [ ] Fullscreen works
- [ ] Back button returns to previous page
- [ ] Error state shows if WD Cloud is unreachable

---

### Task 34: Build Error & Loading States for Player
**Priority:** Medium | **Depends on:** Task 33

- Buffering spinner overlay
- Network error screen with retry
- "Movie not available" for 404
- Timeout handling (30s max buffer wait)

**Acceptance Criteria:**
- [ ] Buffering spinner shows when video is loading
- [ ] Error screen appears if stream fails after 30s
- [ ] Retry button re-attempts the stream

---

### Task 35: Add View Tracking on Play
**Priority:** Medium | **Depends on:** Task 33

When playback starts:
- Send POST to backend to log view (or backend auto-logs on first stream request)
- Update "Continue Watching" in localStorage

**Acceptance Criteria:**
- [ ] Playing a movie updates its view count in DB
- [ ] Progress appears in "Continue Watching" row on homepage

---

## Phase 4: User Features (Tasks 36-40)

### Task 36: My List Page
**Priority:** Medium | **Depends on:** Task 23, Task 24

**File:** `client/src/app/my-list/page.tsx`

- Display all saved movies in grid
- Remove from list button on each card
- Empty state with "Browse Movies" CTA
- Movie count in header

**Acceptance Criteria:**
- [ ] Shows all movies saved in My List
- [ ] Can remove movies from list
- [ ] Empty state shows when list is empty
- [ ] Persists across page reloads

---

### Task 37: Continue Watching Feature
**Priority:** Medium | **Depends on:** Task 23, Task 32

- Save progress to localStorage every 10 seconds during playback
- Show progress bar on movie cards (bottom of poster)
- "Continue Watching" row on homepage (only if in-progress movies exist)
- Clear progress when movie is watched > 90%

**Acceptance Criteria:**
- [ ] Progress bar shows correct percentage on cards
- [ ] Continue Watching row appears when there are in-progress movies
- [ ] Clicking a continue watching card resumes at saved time
- [ ] Completed movies are removed from continue watching

---

### Task 38: Build Admin Dashboard
**Priority:** Medium | **Depends on:** Task 15

**File:** `client/src/app/admin/page.tsx`

- Password gate (from .env ADMIN_PASSWORD)
- Stats overview: total movies, per-genre chart, storage used
- Movie table with search, filter, sort
- "Scan Library" button with progress indicator
- Individual movie actions: refresh TMDB, toggle featured, delete
- Last scan info

**Acceptance Criteria:**
- [ ] Admin page requires password to access
- [ ] Stats display correctly
- [ ] "Scan Library" triggers scan and shows progress
- [ ] Movie table allows TMDB refresh and featured toggle

---

### Task 39: Build 404 & Error Pages
**Priority:** Low | **Depends on:** Task 19

**Files:**
- `client/src/app/not-found.tsx` — Custom 404
- `client/src/app/error.tsx` — Global error boundary
- `client/src/app/loading.tsx` — Global loading

**Acceptance Criteria:**
- [ ] 404 page shows for invalid routes
- [ ] Error boundary catches runtime errors
- [ ] Loading page shows during navigation

---

### Task 40: Build Footer Component
**Priority:** Low | **Depends on:** Task 19

**File:** `client/src/components/layout/Footer.tsx`

- Simple footer: "MovieCloud" + "Powered by WD Cloud"
- Dark background (#0a0a0a)
- Minimal, not distracting

---

## Phase 5: Polish & Deployment (Tasks 41-47)

### Task 41: Performance Optimization
**Priority:** Medium | **Depends on:** All previous

- Add `next/image` for all poster/backdrop images
- Implement dynamic imports for VideoPlayer component
- Add prefetch on link hover
- Optimize bundle size (analyze with `@next/bundle-analyzer`)
- Add Lighthouse CI check

**Acceptance Criteria:**
- [ ] Lighthouse performance score > 85
- [ ] VideoPlayer is code-split (loaded only on /watch pages)
- [ ] Images use next/image with proper sizes

---

### Task 42: SEO & Meta Tags
**Priority:** Low | **Depends on:** Task 28, Task 29

- Add metadata to all pages (title, description, OG image)
- Add structured data (JSON-LD for movies)
- Add favicon, apple-touch-icon
- Add robots.txt and sitemap.xml

**Acceptance Criteria:**
- [ ] Each movie page has unique title and meta description
- [ ] OG images work when shared on social media
- [ ] Favicon displays in browser tab

---

### Task 43: Testing
**Priority:** Medium | **Depends on:** All previous

**Install:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**Tests to write:**
- Filename parser: 10+ test cases
- API client: error handling, response parsing
- Movie card: renders correctly, hover state
- Search: debounce, results display
- Video player: initializes, handles errors

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] At least 70% coverage on utility functions

---

### Task 44: Setup Cloudflare Tunnel
**Priority:** High | **Depends on:** Task 18, Task 28

**Steps:**
1. Create Cloudflare account (if not exists)
2. Add domain DNS to Cloudflare
3. Install cloudflared
4. Create tunnel: `cloudflared tunnel create moviecloud`
5. Configure `~/.cloudflared/config.yml`
6. Route DNS: `cloudflared tunnel route dns moviecloud movies.yourdomain.com`
7. Install as systemd service

**Acceptance Criteria:**
- [ ] Site is accessible via `https://movies.yourdomain.com`
- [ ] HTTPS works with valid certificate
- [ ] Tunnel auto-starts on boot

---

### Task 45: Setup PM2 for Production
**Priority:** High | **Depends on:** Task 44

**Ecosystem file:** `ecosystem.config.js`
```javascript
module.exports = {
  apps: [
    {
      name: 'moviecloud-api',
      script: 'server/server.js',
      cwd: './',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'moviecloud-web',
      script: 'npm',
      args: 'start',
      cwd: './client',
      env: { NODE_ENV: 'production', PORT: 3000 },
    },
  ],
};
```

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Acceptance Criteria:**
- [ ] Both processes run under PM2
- [ ] `pm2 restart moviecloud-api` works
- [ ] Processes auto-restart on crash

---

### Task 46: Final Integration Testing
**Priority:** Critical | **Depends on:** All previous

**Test the complete flow:**
1. Open site → Homepage loads with hero and movie rows ✓
2. Scroll through genre rows ✓
3. Search for a movie ✓
4. Click movie card → Detail page ✓
5. Click "Play Now" → Video streams and plays ✓
6. Seek to different positions ✓
7. Pause, close, reopen → Resumes from saved position ✓
8. Add movie to My List → Appears in My List page ✓
9. Admin: Trigger scan → Movies populate from WD Cloud ✓
10. Admin: Toggle featured → Hero banner updates ✓
11. Test on mobile phone (real device) ✓
12. Test on different browsers ✓

**Acceptance Criteria:**
- [ ] All 12 test scenarios pass
- [ ] No console errors
- [ ] Video streams without buffering on local network

---

### Task 47: Documentation & Handoff
**Priority:** Low | **Depends on:** Task 46

- Update README.md with:
  - Setup instructions (step by step)
  - Environment variables explanation
  - How to run in development
  - How to deploy
  - How to add a new movie (just drop file in WD Cloud + scan)
  - Troubleshooting common issues

**Acceptance Criteria:**
- [ ] README has complete setup guide
- [ ] New developer can set up the project from README alone

---

## Dependency Graph (Simplified)

```
Phase 0 (Setup):
  Task 1 → Task 2 → Task 8
  Task 1 → Task 3 → Task 6 → Task 12
  Task 1 → Task 4
  Task 1 → Task 5 → Task 6
  Task 4 → Task 7

Phase 1 (Backend):
  Task 9 (Parser)
  Task 10 (TMDB)
  Task 7 + 9 + 10 → Task 11 (Scanner)
  Task 6 + 11 → Task 12 (Movies API)
  Task 7 + 12 → Task 13 (Stream)
  Task 10 → Task 14 (Images)
  Task 11 + 12 → Task 15 (Admin)
  Task 6 + 12 → Task 16 (Genres/System)
  Task 12 → Task 17 (View Logs)
  All Routes → Task 18 (Wire Up)

Phase 2 (Frontend):
  Task 19 (Styles) → Task 20 (Header) → Task 21 (Mobile Nav)
  Task 8 → Task 22 (API/Hooks) → Task 23 (Stores)
  Task 19 + 22 → Task 24 (Movie Card) → Task 25 (Movie Row)
  Task 22 → Task 26 (Hero)
  Task 22 + 24 → Task 27 (Search)
  Task 25 + 26 → Task 28 (Homepage)
  Task 24 + 25 → Task 29 (Detail Page)
  Task 24 → Task 30 (Genre Page)

Phase 3 (Player):
  Task 13 → Task 31 (Video.js) → Task 32 (Features) → Task 33 (Watch Page)
  Task 33 → Task 34 (Error States)
  Task 33 → Task 35 (View Tracking)

Phase 4 (Features):
  Task 23 + 24 → Task 36 (My List)
  Task 23 + 32 → Task 37 (Continue Watching)
  Task 15 → Task 38 (Admin)
  Task 19 → Task 39 (404/Error) + Task 40 (Footer)

Phase 5 (Deploy):
  All → Task 41 (Perf) → Task 42 (SEO) → Task 43 (Tests)
  Task 18 + 28 → Task 44 (Tunnel) → Task 45 (PM2)
  All → Task 46 (Integration Test) → Task 47 (Docs)
```

---

## Parallelizable Task Groups

These tasks can be executed in parallel by separate agent instances:

| Group | Tasks | Can Run In Parallel With |
|-------|-------|--------------------------|
| A | 9, 10 (Parser, TMDB) | Each other |
| B | 14, 16, 17 (Images, Genres, View Logs) | Each other |
| C | 20, 22, 23 (Header, API client, Stores) | Each other |
| D | 29, 30 (Detail page, Genre page) | Each other |
| E | 34, 35, 36, 37 (Player errors, tracking, my list, continue) | Each other |
| F | 39, 40, 42 (404, footer, SEO) | Each other |