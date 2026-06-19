# Product Requirements Document (PRD)
## MovieCloud — Premium Movie Streaming Platform

---

## 1. Executive Summary

**Product Name:** MovieCloud  
**Version:** 1.0 (MVP — Phase 1)  
**Date:** June 2026  
**Author:** Product Team  

MovieCloud is a Netflix/Amazon Prime-inspired movie streaming platform that connects to a **Western Digital (WD) My Cloud NAS** device and streams movies in real-time to visitors. The platform requires **no authentication** — visitors land on the site, browse movies, click, and watch instantly. Movie metadata and posters are enriched via the **TMDB API**. All movie metadata is stored in a **MySQL database** running on local **XAMPP (port 3306)**. The architecture uses a **hybrid deployment model**: a local Node.js backend proxy handles WD Cloud communication and database operations, while the Next.js frontend can be deployed to Vercel/Netlify or co-hosted alongside the backend.

---

## 2. Problem Statement

A personal movie collection (hundreds of movies) is stored on a WD My Cloud NAS device. Currently there is no elegant way for community members, friends, and family to browse and stream these movies remotely. The goals are:

- Provide a **Netflix-like browsing experience** with poster art, genres, search, and hover previews
- Enable **instant streaming** directly from the WD Cloud without requiring downloads
- Eliminate the need for users to install any software or configure network access
- Deliver a **responsive, mobile-friendly** interface that works on all devices
- Automate **movie metadata enrichment** (posters, descriptions, ratings) using TMDB API

---

## 3. Goals & Objectives

| Goal | Metric | Target |
|------|--------|--------|
| Seamless streaming from WD Cloud | Buffering time | < 3 seconds |
| Professional UI/UX | User satisfaction | Netflix-quality feel |
| Fast search & filtering | Search response time | < 500ms |
| Mobile responsive | Device coverage | Desktop, Tablet, Phone |
| Easy movie discovery | Click-through rate | > 50% of visitors stream |
| Automated metadata | Poster coverage | > 95% movies have posters |
| Zero authentication friction | Onboarding time | Instant (no sign-up) |

---

## 4. Target Audience

- **Primary:** Community members, friends, and family with the link
- **Devices:** Desktop, Laptop, Tablet, Smartphone
- **Browsers:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Access:** Public (no login required) — link-based access control

---

## 5. Technical Architecture

### 5.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        VISITOR'S BROWSER                              │
│            (Next.js Frontend — Netflix-like UI)                       │
│         Deployed on: Vercel / Netlify / Hostinger                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ HTTPS / API Calls
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     BACKEND PROXY SERVER                              │
│              (Node.js / Express — runs locally)                       │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │ API Routes   │  │ Stream Proxy │  │ TMDB Metadata Enrichment   │  │
│  │ /api/v1/*   │  │ /stream/*    │  │ Poster fetch + cache       │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬─────────────────┘  │
└─────────┼────────────────┼─────────────────────┼─────────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   MySQL DB   │  │   WD My Cloud    │  │   TMDB API       │
│  (XAMPP)     │  │   NAS Device     │  │  (themoviedb.org)│
│  Port: 3306  │  │  10.65.1.150     │  │  Posters/Meta    │
│              │  │  WebDAV + SMB    │  │                  │
└──────────────┘  └──────────────────┘  └──────────────────┘
```

### 5.2 WD Cloud Access Strategy

The WD My Cloud NAS at `10.65.1.150` is on a **local private network**. Two access methods are available:

**Method A — Local SMB/CIFS Mount (Recommended for backend running on same network):**
```
Mount point: /mnt/wdcloud (Linux) or Z:\ (Windows)
SMB Path: \\10.65.1.150\trailermaster786\Movies 2026
Credentials: Configured in .env file
```

**Method B — WebDAV Remote Access (For remote backend hosting):**
```
Base URL: https://remotewdcom.wd.com/webdav/  (via mycloud.com relay)
Or: https://<device-id>.wdmycloud.com/webdav/
Protocol: WebDAV over HTTPS
Credentials: WD Cloud account credentials
```

**Method C — Cloudflare Tunnel (Recommended for production):**
```bash
# Expose local backend + WD Cloud to internet
cloudflared tunnel create moviecloud
cloudflared tunnel route dns moviecloud movies.yourdomain.com
cloudflared tunnel run --url http://localhost:3001
```

> **Architecture Decision:** For MVP, the backend proxy runs on the **same local machine** (or network) as the WD Cloud. A Cloudflare Tunnel exposes it to the internet. This eliminates latency and avoids WebDAV relay limitations.

### 5.3 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+ (React 18) | Server-side rendering, routing |
| **UI Framework** | Tailwind CSS 3 + Framer Motion | Styling + Animations |
| **Video Player** | Video.js or Plyr.io | HTML5 video with HLS/DASH |
| **Backend** | Node.js + Express.js | API server, stream proxy |
| **Database** | MySQL 8.0 (XAMPP, port 3306) | Movie metadata, settings |
| **ORM** | Prisma or mysql2/promise | Database interactions |
| **Search** | Fuse.js | Client-side fuzzy search |
| **Metadata** | TMDB API v3 | Posters, descriptions, ratings |
| **Image Cache** | Sharp + Local FS | Resize & cache TMDB posters |
| **WD Cloud Access** | SMB2 (npm) + WebDAV client | Read movie files from NAS |
| **Deployment (Frontend)** | Vercel or Netlify | Static/SSR hosting |
| **Deployment (Backend)** | PM2 + Cloudflare Tunnel | Local server + public URL |
| **Font** | Inter (Google Fonts) | Clean, modern typography |

### 5.4 Environment Variables

```env
# WD Cloud Credentials
WD_CLOUD_HOST=10.65.1.150
WD_CLOUD_SHARE=trailermaster786
WD_CLOUD_USERNAME=<your_wd_email>
WD_CLOUD_PASSWORD=<your_wd_password>
WD_CLOUD_MOVIES_PATH=Movies 2026

# WD Cloud WebDAV (alternative remote access)
WD_WEBDAV_URL=https://<device-id>.wdmycloud.com/webdav
WD_WEBDAV_USERNAME=<your_wd_email>
WD_WEBDAV_PASSWORD=<your_wd_password>

# MySQL Database (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=moviecloud

# TMDB API
TMDB_API_KEY=<your_tmdb_api_key>
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
STREAM_CHUNK_SIZE=1048576
```

---

## 6. Feature Requirements — Phase 1 (MVP)

### 6.1 Home Page

- **Hero Banner:** Full-width featured movie carousel
  - Auto-rotates through 5 featured movies every 8 seconds
  - Pause on hover
  - Gradient overlay with title, rating, synopsis, and "Play Now" button
  - Smooth crossfade transitions (1s ease-in-out)
- **Movie Rows:** Horizontally scrollable rows by genre
  - Action, Comedy, Drama, Horror, Sci-Fi, Thriller, Animation, Other
  - "Recently Added" row
  - "Most Popular" row (by view count)
- **Scroll Behavior:** Mouse drag + touch swipe + momentum scroll
- **Navigation Arrows:** Left/right arrows on desktop, snap scroll on mobile
- **"See All" link** on each row → genre page

### 6.2 Movie Card Component

- Poster image (2:3 aspect ratio) with lazy loading
- On hover: Card scales to 1.05x, shows overlay with:
  - Movie title + year
  - Rating badge (IMDb gold star)
  - Genre tag
  - Duration
  - Three action buttons: Play, Info, Add to List
- On mobile (touch): Tap shows bottom sheet with same info
- Shimmer/skeleton loading state while poster loads
- Fallback gradient poster if TMDB image not found

### 6.3 Movie Detail Page

- **Full-width backdrop** at top with gradient fade
- **Movie info section:**
  - Title (large), Year, Duration, Quality badge
  - Rating with star icon
  - Genre tags (clickable → genre filter)
  - Full synopsis
  - Cast & Director (if available from TMDB)
- **Action buttons:**
  - "Play Now" (large primary button)
  - "Add to My List" (saves to localStorage)
  - "Share" (copies link)
- **Technical Info Bar:**
  - Resolution (720p / 1080p / 4K)
  - Audio (5.1, Dolby, Dual Audio)
  - File size
  - Subtitle availability
- **Similar Movies:** Horizontal row of related movies from same genre
- **Back navigation** on mobile

### 6.4 Video Player

- **Engine:** Video.js or Plyr with HTML5 video
- **Core Controls:**
  - Play / Pause
  - Volume slider
  - Progress bar with seek (shows thumbnail on hover — stretch goal)
  - Fullscreen toggle
  - Playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- **Advanced Features:**
  - Resume playback (progress saved to localStorage)
  - Keyboard shortcuts (Space, Arrow keys, F, M, Esc)
  - Picture-in-Picture (PiP) support
  - Double-click for fullscreen
  - Auto-hide controls after 3 seconds of inactivity
- **Streaming:** Video is proxied through the backend API. The backend reads from WD Cloud (SMB or WebDAV) and pipes the stream to the client with proper HTTP range request support (206 Partial Content) for seeking.
- **Error Handling:** Friendly error screen if stream fails, with retry button

### 6.5 Search

- **Search Bar:** Prominent in header, always accessible
- **Behavior:** Real-time results as user types (debounced 300ms)
- **Search Fields:** Title, genre, year
- **Dropdown Results:** Show top 6 matching movies with posters
- **Full Results Page:** Clicking "See all results" shows grid of all matches
- **Recent Searches:** Saved to localStorage (last 10)
- **Empty State:** "No movies found" illustration with suggestion to check spelling
- **Keyboard Navigation:** Arrow keys + Enter in dropdown

### 6.6 Genre Pages

- **URL Pattern:** `/genre/[slug]` (e.g., `/genre/action`)
- **Header:** Genre title + movie count
- **Filter Bar:**
  - Sort by: Title A-Z, Title Z-A, Year (newest), Year (oldest), Rating (highest), Recently Added
  - Year range slider (optional for MVP)
- **Grid Layout:** Responsive grid (3-8 columns depending on screen)
- **Infinite Scroll or Pagination:** Load 20 movies at a time
- **Active Genre Highlight:** In navigation

### 6.7 My List (localStorage-based)

- **Add/Remove:** Heart or "+" button on cards and detail pages
- **Dedicated Page:** `/my-list` shows all saved movies
- **Persistence:** localStorage (no server-side storage in MVP)
- **Empty State:** "Your list is empty" with browse suggestion

### 6.8 Continue Watching

- **Track Progress:** Save current timestamp per movie to localStorage
- **Badge on Card:** Show progress bar at bottom of card
- **Dedicated Row:** "Continue Watching" row on homepage (if any in-progress movies)
- **Resume:** Clicking opens player at saved timestamp

### 6.9 Admin Panel (Simple — Phase 1)

- **URL:** `/admin` (protected by simple password in .env or basic auth)
- **Features:**
  - "Scan Library" button → triggers re-scan of WD Cloud directories
  - Movie list with edit/delete capability
  - TMDB metadata refresh for individual movies
  - View statistics (total movies, total size, genre distribution)
  - Toggle featured movies for hero banner

### 6.10 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 640px) | Single column, bottom nav, full-width cards, hamburger menu |
| Tablet (641-1024px) | 2-3 cards/row, collapsible sidebar, touch-friendly |
| Desktop (1025-1440px) | 5-6 cards/row, full nav, hover states |
| Large Desktop (1441px+) | 7-8 cards/row, wider spacing, larger hero |

---

## 7. API Design

### 7.1 Endpoints

```
Base URL: /api/v1

--- Movies ---
GET    /movies                  List all movies (paginated, filterable, sortable)
GET    /movies/featured         Get 5 featured movies for hero banner
GET    /movies/genre/:slug      Get movies by genre slug
GET    /movies/search?q=       Search movies by title/genre/year
GET    /movies/recent           Recently added movies (last 30)
GET    /movies/popular          Most viewed movies (top 20)
GET    /movies/:id              Get single movie detail
GET    /movies/:id/similar      Get similar movies (same genre)

--- Streaming ---
GET    /stream/:id              Stream movie (supports Range headers for seeking)
HEAD   /stream/:id              Get stream metadata (size, content-type)
GET    /stream/:id/subtitle     Serve subtitle file if available (.srt, .vtt)

--- Images (TMDB Proxy + Cache) ---
GET    /image/poster/:id        Get cached poster image
GET    /image/backdrop/:id      Get cached backdrop image
GET    /image/tmdb/*            Proxy TMDB images with local cache

--- Admin ---
POST   /admin/scan              Trigger library scan of WD Cloud
PUT    /admin/movies/:id        Update movie metadata
DELETE /admin/movies/:id        Remove movie from database
POST   /admin/movies/:id/refresh  Re-fetch TMDB metadata
GET    /admin/stats             Collection statistics
POST   /admin/featured/:id      Toggle featured status

--- System ---
GET    /health                  Health check (DB + WD Cloud connectivity)
GET    /genres                  Get all genres with movie counts
```

### 7.2 Example API Responses

```json
// GET /api/v1/movies?page=1&genre=action&sort=year&order=desc
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "2-guns-2013",
        "title": "2 Guns",
        "year": 2013,
        "genres": ["Action"],
        "rating": 7.3,
        "duration": 109,
        "quality": "1080p",
        "posterUrl": "/api/v1/image/poster/2-guns-2013",
        "backdropUrl": "/api/v1/image/backdrop/2-guns-2013",
        "filePath": "Action/2 Guns 2013 Dual Audio Hindi (ORG 5.1) 1080p WEB-DL x264 ESubs.mkv",
        "viewCount": 42,
        "featured": false,
        "addedAt": "2026-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 23,
      "totalPages": 2
    }
  }
}

// GET /api/v1/movies/2-guns-2013
{
  "success": true,
  "data": {
    "id": "2-guns-2013",
    "title": "2 Guns",
    "originalTitle": "2 Guns",
    "year": 2013,
    "duration": 109,
    "genres": ["Action", "Thriller"],
    "synopsis": "A DEA agent and a naval intelligence officer find themselves on the run after a botched attempt to infiltrate a drug cartel.",
    "rating": 7.3,
    "posterUrl": "/api/v1/image/poster/2-guns-2013",
    "backdropUrl": "/api/v1/image/backdrop/2-guns-2013",
    "trailerUrl": "https://www.youtube.com/watch?v=example",
    "cast": ["Denzel Washington", "Mark Wahlberg"],
    "director": "Baltasar Kormakur",
    "language": "English, Hindi",
    "quality": "1080p",
    "audio": "Dual Audio (Hindi ORG 5.1)",
    "subtitles": true,
    "filePath": "Action/2 Guns 2013 Dual Audio Hindi (ORG 5.1) 1080p WEB-DL x264 ESubs.mkv",
    "fileSize": 2147483648,
    "viewCount": 42,
    "featured": false,
    "addedAt": "2026-01-15T00:00:00Z",
    "updatedAt": "2026-01-15T00:00:00Z"
  }
}

// GET /api/v1/stream/2-guns-2013
// Response: 206 Partial Content (with Range header support)
// Headers:
//   Content-Type: video/x-matroska
//   Content-Length: 1048576
//   Accept-Ranges: bytes
//   Content-Range: bytes 0-1048575/2147483648
```

### 7.3 Stream Proxy Implementation

```javascript
// Backend: /api/v1/stream/[id] — Express route
// Supports HTTP Range requests for video seeking
// Reads from WD Cloud via SMB mount or WebDAV and pipes to client

import { createReadStream, statSync } from 'fs';
import path from 'path';

export async function streamMovie(req, res) {
  const movie = await getMovieFromDB(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  const fullPath = path.join(WD_MOUNT_POINT, movie.filePath);

  try {
    const stat = statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range request for seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': getMimeType(fullPath),
        'Cache-Control': 'no-cache',
      });

      createReadStream(fullPath, { start, end }).pipe(res);
    } else {
      // Full file response
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': getMimeType(fullPath),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });

      createReadStream(fullPath).pipe(res);
    }
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ error: 'Streaming failed' });
  }
}
```

---

## 8. TMDB Integration

### 8.1 Getting a TMDB API Key

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to Account Settings → API → Request API Key
4. Select "Developer" and fill in the form
5. Receive your API key (v3 auth)

### 8.2 Metadata Enrichment Flow

```
Movie filename parsed → Extract "Title" + "Year"
        ↓
Query TMDB Search API: /search/movie?query=Title&year=Year
        ↓
Match found? → YES → Fetch details: /movie/{id}
        ↓                          ↓
    Use TMDB data          poster_path, backdrop_path,
    (title, synopsis,       overview, cast, genres,
     rating, cast,          release_date, runtime,
     genres, director)      vote_average
        ↓
    Save to MySQL          Download & cache poster/backdrop
    moviecloud.movies      images locally to /public/posters/
```

### 8.3 Filename Parsing Pattern

Current WD Cloud naming convention:
```
[Title] [Year] [Audio Info] [Resolution] [Source] [Codec] [Subtitles].mkv
```

Example:
```
Anora 2024 Dual Audio Hindi (ORG 5.1) 1080p WEB-DL x264 ESubs.mkv
```

Parser extracts:
- **Title:** "Anora"
- **Year:** 2024
- **Audio:** "Dual Audio Hindi (ORG 5.1)"
- **Resolution:** "1080p"
- **Source:** "WEB-DL"
- **Codec:** "x264"
- **Subtitles:** true (ESubs)

---

## 9. Deployment Strategy

### 9.1 Recommended: Hybrid Deployment

```
┌─────────────────────────────────────────────────────┐
│  YOUR HOME NETWORK (10.65.1.x)                      │
│                                                      │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │  WD My Cloud │     │  Local Server / PC       │  │
│  │  NAS         │◄───►│  ┌─────────────────────┐ │  │
│  │  10.65.1.150 │ SMB │  │  Node.js Backend    │ │  │
│  │              │     │  │  (Express) :3001    │ │  │
│  └──────────────┘     │  ├─────────────────────┤ │  │
│                       │  │  MySQL (XAMPP)      │ │  │
│  ┌──────────────┐     │  │  :3306              │ │  │
│  │  Admin PC    │     │  ├─────────────────────┤ │  │
│  │  (Browser)   │     │  │  Next.js Frontend   │ │  │
│  │              │     │  │  :3000 (or static)  │ │  │
│  └──────────────┘     │  └─────────────────────┘ │  │
│                       │         ▲                 │  │
│                       │         │ PM2 +           │  │
│                       │         │ Cloudflare      │  │
│                       │         │ Tunnel          │  │
│                       └─────────┼─────────────────┘  │
└─────────────────────────────────┼───────────────────┘
                                  │ HTTPS Tunnel
                                  ▼
                       ┌─────────────────────┐
                       │  Internet Users     │
                       │  movies.yourdomain  │
                       │  .com               │
                       └─────────────────────┘
```

### 9.2 Deployment Options

| Option | Frontend | Backend | Best For |
|--------|----------|---------|----------|
| **A. Full Local + Cloudflare Tunnel** | Served by Express | Same server | Zero cost, full control |
| **B. Vercel Frontend + Local Backend** | Vercel (free) | Local + Tunnel | Best performance, free frontend |
| **C. Hostinger VPS** | Hostinger | Hostinger | All-in-one, $5-10/mo |

**Recommended for MVP:** Option A — everything runs locally, Cloudflare Tunnel provides HTTPS + public URL. Zero cost, simplest setup, and the backend has direct access to WD Cloud and MySQL.

### 9.3 Cloudflare Tunnel Setup

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate (opens browser)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create moviecloud

# Create config file: ~/.cloudflared/config.yml
tunnel: <tunnel-id>
credentials-file: /home/user/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: movies.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404

# Route DNS
cloudflared tunnel route dns moviecloud movies.yourdomain.com

# Run as service (systemd)
sudo cloudflared service install
```

### 9.4 PM2 Process Management

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start server.js --name "moviecloud-api"

# Start frontend (if not using Vercel)
pm2 start "npm run dev" --name "moviecloud-web"

# Save and auto-restart
pm2 save
pm2 startup
```

---

## 10. Security Considerations

### 10.1 MVP Security (No Auth)

- **Admin panel** protected by environment-variable password (basic auth or simple gate)
- **No raw file paths** exposed to client — always use movie IDs
- **Rate limiting** on stream endpoints (prevent abuse)
- **CORS** configured to allow only your frontend domain
- **Helmet.js** for HTTP security headers
- **No directory listing** — only proxied file access
- **Input sanitization** on all API parameters
- **Environment variables** for all sensitive credentials (never hardcoded)

### 10.2 Future: Authentication (Phase 2)

- JWT-based auth with refresh tokens
- Invite-code registration system
- Role-based access: admin vs. member
- Password hashing with bcrypt

---

## 11. Performance Optimization

### 11.1 Caching Strategy

| Cache Layer | Tool | TTL | Purpose |
|-------------|------|-----|---------|
| Movie metadata | In-memory (LRU) | 1 hour | Reduce DB queries |
| TMDB images | Local filesystem | 7 days | Avoid re-downloading posters |
| Search results | In-memory (LRU) | 5 minutes | Fast repeated searches |
| API responses | HTTP Cache-Control | Varies | Browser caching |
| Video stream | None | N/A | Direct pipe, no caching |

### 11.2 Image Optimization

- Download TMDB posters at original quality
- Resize and serve via Sharp (multiple sizes: w200, w500, original)
- WebP format with JPEG fallback
- Lazy loading with IntersectionObserver
- Blur placeholder (base64, 20px wide) during load

### 11.3 Frontend Performance

- Next.js Image component for automatic optimization
- Dynamic imports for heavy components (video player)
- Code splitting per route
- Prefetch links on hover
- Service worker for offline poster caching (stretch)

---

## 12. Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit Tests | Jest | Core utilities, filename parser |
| API Tests | Supertest + Jest | All API endpoints |
| E2E Tests | Playwright | Browse → Play → Seek flow |
| Performance | Lighthouse CI | Score > 90 all categories |
| Stream Tests | Manual + k6 | Concurrent stream capacity |

### Critical Test Cases

- [ ] Home page loads in < 3 seconds
- [ ] Movie cards render on all breakpoints (mobile, tablet, desktop)
- [ ] Search returns results in < 500ms
- [ ] Video player starts within 3 seconds
- [ ] Video seeking works without full re-buffer
- [ ] Genre filtering and sorting work correctly
- [ ] My List add/remove persists across page reloads
- [ ] Continue Watching resumes at correct timestamp
- [ ] Admin scan discovers new movies from WD Cloud
- [ ] TMDB metadata is fetched and cached correctly
- [ ] 404 page shows for invalid movie IDs
- [ ] Stream proxy handles Range requests correctly

---

## 13. Movie Library Directory Structure (on WD Cloud)

```
\\10.65.1.150\trailermaster786\Movies 2026\
├── Action/
│   ├── 2 Guns 2013 Dual Audio Hindi (ORG 5.1) 1080p WEB-DL x264 ESubs.mkv
│   ├── ...
├── Animation/
│   ├── ...
├── Comedy/
│   ├── ...
├── Drama/
│   ├── ...
├── Horror/
│   ├── ...
├── Other/
│   ├── ...
├── Sci-Fi/
│   ├── ...
└── Thriller/
    ├── ...
```

Each folder maps to a genre. Files follow the naming pattern:
```
[Title] [Year] [Audio Info] [Resolution] [Source] [Codec] [Subtitles].mkv
```

Supported video formats: `.mkv`, `.mp4`, `.avi`, `.wmv`, `.mov`

---

## 14. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | < 3s | Lighthouse |
| Video Start Time | < 3s | Player analytics |
| Buffering Ratio | < 2% | Player analytics |
| Search Response | < 500ms | API logs |
| Mobile Usability | 100% | Lighthouse |
| Poster Coverage | > 95% | Admin stats |
| Accessibility Score | > 85 | Lighthouse |

---

## 15. Timeline — Phase 1 MVP (4-6 Weeks)

| Week | Tasks |
|------|-------|
| **Week 1** | Project setup, MySQL schema, WD Cloud connection, filename parser |
| **Week 2** | Backend API (movies, search, genres), TMDB integration, image cache |
| **Week 3** | Frontend: Layout, header, hero banner, movie cards, genre rows |
| **Week 4** | Frontend: Movie detail page, video player, search, genre pages |
| **Week 5** | My List, Continue Watching, responsive design, admin panel |
| **Week 6** | Testing, optimization, Cloudflare Tunnel setup, deployment, launch |

---

## 16. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| WD Cloud network instability | High | Medium | Graceful error UI, retry logic, offline message |
| Large video files buffering | High | Medium | Chunked streaming, preload first 5MB, adaptive quality |
| TMDB rate limits | Medium | Low | Cache all responses, batch requests, respect rate limits |
| Private IP not reachable | High | Low | Cloudflare Tunnel or WebDAV remote access |
| Storage failure on NAS | High | Low | MySQL backup, metadata is separate from files |
| Concurrent streams overload | Medium | Medium | Stream rate limiting, connection pooling |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Product Team | Initial PRD |
| 1.1 | June 2026 | Product Team | Updated: MySQL (XAMPP), WD Cloud WebDAV/SMB, no-auth MVP, hybrid deployment |