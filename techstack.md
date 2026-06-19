# Technology Stack
## MovieCloud — Complete Stack Reference & Setup Guide

---

## 1. Stack Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Client)                            │
│  Next.js 14+  ·  React 18  ·  TypeScript  ·  Tailwind CSS 3        │
│  Framer Motion  ·  Zustand  ·  Video.js  ·  Lucide React           │
├─────────────────────────────────────────────────────────────────────┤
│                        BACKEND (Server)                             │
│  Node.js 20 LTS  ·  Express.js 4  ·  MySQL2  ·  Sharp              │
│  Helmet  ·  CORS  ·  Compression  ·  Morgan  ·  dotenv             │
├─────────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE                               │
│  MySQL 8.0 (XAMPP)  ·  WD My Cloud NAS  ·  Cloudflare Tunnel       │
│  PM2 Process Manager  ·  Linux (Ubuntu 22.04+)                     │
├─────────────────────────────────────────────────────────────────────┤
                        EXTERNAL SERVICES
│  TMDB API v3 (metadata + images)  ·  Google Fonts (Inter)          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Stack

### 2.1 Next.js 14+ (App Router)

**Version:** `14.2.x` or later
**Purpose:** React framework with SSR, routing, and API proxying

**Why Next.js:**
- App Router for file-based routing with layouts
- Server-side rendering for fast initial load and SEO
- Built-in image optimization with `next/image`
- API route rewrites to proxy backend requests (no CORS issues)
- Static export option for Vercel/Netlify deployment

**Key Configuration:**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API calls to Express backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
  // Allow TMDB images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
```

**Install:**
```bash
npx create-next-app@latest client --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Package.json key dependencies:**
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0"
}
```

---

### 2.2 TypeScript

**Version:** `5.x`
**Purpose:** Type safety across the codebase

**Install:**
```bash
npm install -D typescript @types/node @types/react @types/react-dom
```

**Key Type Definitions (save in `client/src/types/index.ts`):**

```typescript
// Movie type matching MySQL schema
export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number | null;
  duration: number | null;
  synopsis: string | null;
  rating: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl?: string;
  quality?: string;
  audioInfo?: string;
  hasSubtitles: boolean;
  language?: string;
  filePath: string;
  fileName: string;
  fileSize: number | null;
  cast?: string[] | null;
  director?: string | null;
  viewCount: number;
  featured: boolean;
  isActive: boolean;
  addedAt: string;
  updatedAt: string;
  genres?: string[];
  genreSlugs?: string[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    movies: Movie[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Genre with count
export interface Genre {
  id: number;
  name: string;
  slug: string;
  movieCount: number;
}

// Search result (lighter than full Movie)
export interface SearchResult {
  id: string;
  title: string;
  year: number | null;
  rating: number | null;
  posterUrl: string | null;
  genres?: string[];
  quality?: string;
  duration?: number | null;
}

// Watch progress (localStorage)
export interface WatchProgress {
  movieId: string;
  currentTime: number;
  duration: number;
  lastWatched: string;
}

// Parsed filename data
export interface ParsedFilename {
  title: string;
  year: number | null;
  quality: string | null;
  audioInfo: string | null;
  hasSubtitles: boolean;
  source: string | null;
  codec: string | null;
  slug: string;
  extension: string;
}
```

---

### 2.3 Tailwind CSS 3

**Version:** `3.4.x`
**Purpose:** Utility-first CSS framework for rapid UI development

**Install:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Custom Configuration (tailwind.config.ts):**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        'brand': '#E50914',
        'brand-hover': '#B20710',
        'brand-light': '#F40612',

        // Backgrounds
        'bg-primary': '#141414',
        'bg-secondary': '#1a1a1a',
        'bg-surface': '#1f1f1f',
        'bg-surface-hover': '#282828',
        'bg-elevated': '#2a2a2a',

        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3B3B3',
        'text-muted': '#808080',
        'text-disabled': '#4a4a4a',

        // Accents
        'accent-gold': '#F5C518',
        'accent-green': '#46D369',
        'accent-blue': '#0071EB',
        'accent-orange': '#F59E0B',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-mobile': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      zIndex: {
        'card-hover': '300',
        'overlay': '400',
        'modal': '500',
        'toast': '600',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 2.4 Framer Motion

**Version:** `11.x`
**Purpose:** Declarative animations for React components

**Install:**
```bash
npm install framer-motion
```

**Usage Pattern:**
```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Page transition wrapper
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Movie card hover
export function MovieCard({ movie }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

---

### 2.5 Zustand

**Version:** `4.x`
**Purpose:** Lightweight state management (simpler than Redux for this project)

**Install:**
```bash
npm install zustand
```

**Store Pattern:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// My List store (persists to localStorage)
export const useMyListStore = create(
  persist(
    (set, get) => ({
      movieIds: [] as string[],

      addMovie: (id: string) =>
        set((state) => ({
          movieIds: state.movieIds.includes(id)
            ? state.movieIds
            : [...state.movieIds, id],
        })),

      removeMovie: (id: string) =>
        set((state) => ({
          movieIds: state.movieIds.filter((mid) => mid !== id),
        })),

      toggleMovie: (id: string) => {
        const { movieIds, addMovie, removeMovie } = get();
        movieIds.includes(id) ? removeMovie(id) : addMovie(id);
      },

      isInList: (id: string) => get().movieIds.includes(id),
    }),
    { name: 'moviecloud-my-list' }
  )
);

// Watch progress store
export const useWatchProgressStore = create(
  persist(
    (set) => ({
      progress: {} as Record<string, { currentTime: number; duration: number; lastWatched: string }>,

      updateProgress: (movieId: string, currentTime: number, duration: number) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [movieId]: {
              currentTime,
              duration,
              lastWatched: new Date().toISOString(),
            },
          },
        })),

      removeProgress: (movieId: string) =>
        set((state) => {
          const { [movieId]: _, ...rest } = state.progress;
          return { progress: rest };
        }),

      getProgress: (movieId: string) => get().progress[movieId] || null,
    }),
    { name: 'moviecloud-watch-progress' }
  )
);
```

---

### 2.6 Video.js

**Version:** `8.x`
**Purpose:** HTML5 video player with extensive customization

**Install:**
```bash
npm install video.js @types/video.js
```

**Custom Skin Setup:**
```typescript
// Import Video.js core
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Custom dark theme CSS (create video-player-dark.css)
// Override Video.js default light theme to match MovieCloud dark design
```

**Why Video.js over alternatives:**

| Feature | Video.js | Plyr | HTML5 Native |
|---------|----------|------|-------------|
| Range request support | Yes (built-in) | Yes | Yes |
| Custom skinning | Full CSS control | Limited | None |
| Plugin ecosystem | Large | Small | None |
| HLS/DASH support | Via plugins | Built-in | Via plugins |
| Keyboard shortcuts | Built-in | Built-in | Built-in |
| Touch support | Excellent | Good | Native |
| Bundle size | ~300KB | ~50KB | 0KB |
| Subtitle support | VTT, SRT | VTT | VTT |

**Chosen:** Video.js for its streaming robustness and full customization.

---

### 2.7 Lucide React

**Version:** `0.400+`
**Purpose:** Consistent, lightweight icon set

**Install:**
```bash
npm install lucide-react
```

**Icons Used:** play, pause, search, heart, info, share-2, arrow-left, x, menu, settings, maximize, volume-2, subtitles, star, clock, calendar, film, home, layout-grid, list, arrow-up-down, sliders-horizontal, chevron-right, chevron-left, skip-forward, skip-back

---

### 2.8 Other Frontend Dependencies

```bash
# Intersection Observer for lazy loading
npm install react-intersection-observer

# Date formatting
npm install date-fns

# URL utilities
npm install qs

# Toast notifications
npm install react-hot-toast

# Development
npm install -D @next/bundle-analyzer eslint eslint-config-next
```

---

## 3. Backend Stack

### 3.1 Node.js

**Version:** `20.x LTS`
**Purpose:** JavaScript runtime for the Express backend server

**Why Node.js 20 LTS:**
- Long-term support until April 2026
- Built-in fetch API (no node-fetch needed)
- Improved performance over Node 18
- Stable WebSocket support
- Better ES modules support

**Install (if not present):**
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

### 3.2 Express.js

**Version:** `4.21.x`
**Purpose:** HTTP server framework for REST API and stream proxy

**Install:**
```bash
cd server
npm install express
```

**Middleware Stack (in order):**
```javascript
const app = express();

// 1. Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// 2. CORS (restrict to your domain in production)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Response compression
app.use(compression());

// 4. Request logging
app.use(morgan('combined'));

// 5. JSON body parsing
app.use(express.json({ limit: '10mb' }));

// 6. Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per window
  message: { error: 'Too many requests' },
}));

// 7. API routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/stream', streamRoutes);
// ... etc
```

---

### 3.3 MySQL2

**Version:** `3.x`
**Purpose:** MySQL database driver with promise support

**Why mysql2 over other options:**

| Driver | Promise Support | Performance | Active Maint. |
|--------|----------------|-------------|---------------|
| **mysql2** | Yes (built-in) | Fast | Yes |
| mysql | No (needs wrapper) | Fast | Yes |
| sequelize | Yes (ORM) | Slower | Yes |
| prisma | Yes (ORM) | Good | Yes |
| knex | Yes (query builder) | Good | Yes |

**Chosen:** `mysql2` with `promise` interface — lightweight, fast, direct SQL control (matching our hand-written schema), no ORM overhead.

**Install:**
```bash
npm install mysql2
```

**Connection Pool Setup:**
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
  charset: 'utf8mb4',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = pool;
```

---

### 3.4 Sharp

**Version:** `0.33.x`
**Purpose:** High-performance image processing (poster/backdrop resize + format conversion)

**Install:**
```bash
npm install sharp
```

**Usage:**
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cachePoster(tmdbPosterPath, movieSlug) {
  const tmdbUrl = `${process.env.TMDB_IMAGE_BASE}/w500${tmdbPosterPath}`;
  const response = await fetch(tmdbUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const cacheDir = path.join(process.cwd(), 'public', 'posters');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  // Resize to multiple sizes and save as WebP
  await sharp(buffer)
    .resize(500, 750, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(cacheDir, `${movieSlug}-w500.webp`));

  await sharp(buffer)
    .resize(200, 300, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(path.join(cacheDir, `${movieSlug}-w200.webp`));

  return `/posters/${movieSlug}-w500.webp`;
}
```

---

### 3.5 Other Backend Dependencies

```bash
# Security & middleware
npm install helmet cors compression morgan express-rate-limit

# Environment variables
npm install dotenv

# File system utilities
npm install fs-extra

# UUID for unique IDs (if needed)
npm install uuid

# Development
npm install -D nodemon

# Testing (Phase 5)
npm install -D jest supertest
```

---

## 4. Infrastructure Stack

### 4.1 MySQL 8.0 (XAMPP)

**Version:** `8.0.x` (ships with XAMPP)
**Port:** 3306
**Configuration:**

```ini
# my.ini (XAMPP MySQL config) — ensure these settings:
[mysqld]
port=3306
max_connections=200
innodb_buffer_pool_size=256M
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

[client]
default-character-set=utf8mb4
```

**Access:**
- CLI: `mysql -u root`
- GUI: `http://localhost/phpmyadmin`
- Database: `moviecloud`
- User: `root` (no password for local dev)

---

### 4.2 WD My Cloud NAS

**Model:** WD My Cloud (personal NAS)
**IP:** 10.65.1.150 (local network)
**Share Name:** trailermaster786
**Movies Path:** `Movies 2026/`
**Protocol:** SMB/CIFS (SMBv3 preferred)

**Mount on Linux (permanent):**
```bash
# /etc/fstab entry
//10.65.1.150/trailermaster786 /mnt/wdcloud cifs \
  username=trailermaster786@gmail.com,password=Inotknow@786,\
  vers=3.0,iocharset=utf8,uid=1000,gid=1000,\
  _netdev,nofail,auto 0 0

# Mount manually (test)
sudo mount -a
ls /mnt/wdcloud/Movies\ 2026/
```

**Alternative WebDAV Access (for remote backend):**
```
URL: https://remotewdcom.wd.com/webdav/
Protocol: WebDAV over HTTPS
```

---

### 4.3 Cloudflare Tunnel

**Version:** Latest
**Purpose:** Expose local server to the internet with HTTPS (free)

**Install:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

**Config (~/.cloudflared/config.yml):**
```yaml
tunnel: <your-tunnel-id>
credentials-file: /home/user/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: movies.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

**Cost:** Free (Cloudflare free plan)

---

### 4.4 PM2

**Version:** `5.x`
**Purpose:** Node.js process manager for production

**Install:**
```bash
npm install -g pm2
```

**Ecosystem Config (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [
    {
      name: 'moviecloud-api',
      script: 'server/server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'moviecloud-web',
      script: 'npx',
      args: 'next start',
      cwd: './client',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production', PORT: 3000 },
    },
  ],
};
```

---

## 5. External Services

### 5.1 TMDB API v3

**Base URL:** `https://api.themoviedb.org/3`
**Image CDN:** `https://image.tmdb.org/t/p/{size}/{poster_path}`
**Auth:** API Key in query string (`?api_key=xxx`)
**Rate Limit:** 40 requests per 10 seconds
**Cost:** Free (with attribution)

**Key Endpoints Used:**
| Endpoint | Purpose |
|----------|---------|
| `/search/movie` | Find movie by title + year |
| `/movie/{id}` | Get full details, credits, videos |
| `/movie/{id}/images` | Get all poster/backdrop options |
| `/genre/movie/list` | Get genre ID mappings |

**Image Sizes:**
| Size | Dimensions | Usage |
|------|-----------|-------|
| `w92` | 92x138 | Thumbnails |
| `w185` | 185x278 | Small cards |
| `w342` | 342x513 | Standard cards |
| `w500` | 500x750 | Detail page poster |
| `w780` | 780x1170 | Large poster |
| `original` | Original | Backdrop |

---

### 5.2 Google Fonts (Inter)

**URL:** `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap`
**Cost:** Free
**Usage:** Primary font for the entire application

**Load in Next.js (app/layout.tsx):**
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

## 6. Complete package.json Files

### 6.1 Client (Next.js) — package.json

```json
{
  "name": "moviecloud-client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "video.js": "^8.10.0",
    "lucide-react": "^0.400.0",
    "react-intersection-observer": "^9.10.0",
    "date-fns": "^3.6.0",
    "qs": "^6.12.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/video.js": "^7.3.58",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

### 6.2 Server (Express) — package.json

```json
{
  "name": "moviecloud-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "scan": "node -e \"require('./src/services/scanner').scanLibrary()\"",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.2.0",
    "mysql2": "^3.9.0",
    "sharp": "^0.33.0",
    "dotenv": "^16.4.0",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

---

## 7. System Requirements

### 7.1 Development Machine (Where backend runs)

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Ubuntu 20.04 / Windows 10 | Ubuntu 22.04 LTS |
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB |
| Disk | 1 GB (for app + poster cache) | 10 GB (poster cache grows) |
| Node.js | v18 LTS | v20 LTS |
| MySQL | 8.0 (XAMPP) | 8.0 (XAMPP) |
| Network | Local access to 10.65.1.150 | Same + stable internet for TMDB |

### 7.2 WD Cloud NAS

| Requirement | Value |
|-------------|-------|
| Access | SMB/CIFS or WebDAV |
| Network | Same LAN as development machine |
| Storage | Whatever your movie collection requires |
| Power | Must stay on for streaming to work |

### 7.3 End User (Visitor)

| Requirement | Value |
|-------------|-------|
| Browser | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Internet | Decent broadband (5+ Mbps for 1080p streaming) |
| Device | Any (responsive design) |

---

## 8. Port Map

| Service | Port | URL |
|---------|------|-----|
| Next.js Frontend (dev) | 3000 | http://localhost:3000 |
| Express Backend API | 3001 | http://localhost:3001 |
| MySQL (XAMPP) | 3306 | localhost:3306 |
| phpMyAdmin | 8080 | http://localhost:8080 |
| Cloudflare Tunnel | 443 (HTTPS) | https://movies.yourdomain.com |
| WD Cloud SMB | 445 | \\10.65.1.150\trailermaster786 |

---

## 9. NPM Scripts Reference

### Client (./client/)

```bash
npm run dev      # Start Next.js dev server (port 3000, hot reload)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Server (./server/)

```bash
npm run dev      # Start Express with nodemon (auto-restart on changes)
npm run start    # Start Express in production
npm run scan     # Manually trigger a full library scan
npm run test     # Run Jest tests
```

### Root (./)

```bash
# Run both frontend and backend in development
npm run dev:all   # Uses concurrently or separate terminals

# Using PM2
pm2 start ecosystem.config.js
pm2 stop all
pm2 restart all
pm2 logs
```

---

## 10. Skills & Tools (Reference)

| Skill/Tool | Install Command | Purpose | Phase Used |
|-----------|-----------------|---------|------------|
| uipro-cli | `npm install -g uipro-cli` | Project scaffolding | Setup |
| Frontend Design | `npx skills add anthropics/claude-code --skill frontend-design` | Design guidance | Build |
| Browser Use | `npx skills add https://github.com/browser-use/browser-use --skill browser-use` | E2E testing | Testing |
| Code Reviewer | `npx claude-code-templates@latest --skill development/code-reviewer` | Code review | Review |
| Remotion | `npx skills add remotion/agent-skills` | Video generation | Post-MVP |
| Google Workspace | `npm install -g @googleworkspace/cli` | GWS integration | Post-MVP |
| Shannon | `npx skills add unicodeveloper/shannon` | Security testing | Pre-launch |
| Excalidraw | `npx skills add https://github.com/coleam00/excalidraw-diagram-skill --skill excalidraw-diagram` | Diagrams | Docs |