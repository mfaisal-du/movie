# Application Flow
## MovieCloud — Complete Flow Diagrams & User Journeys

---

## 1. System Startup Flow

```
[Server Start]
      │
      ▼
[Load .env configuration]
(WD Cloud creds, MySQL creds, TMDB key)
      │
      ▼
[Connect to MySQL (port 3306)]
      │
      ├─ FAIL → [Log error + Exit with code 1]
      │
      ▼ SUCCESS
[Verify WD Cloud accessibility]
      │
      ├─ SMB mount check: /mnt/wdcloud exists?
      │   ├─ YES → Continue
      │   └─ NO  → Try to mount, or log warning (WebDAV fallback)
      │
      ▼
[Run database migrations if needed]
(Check if tables exist, create if not)
      │
      ▼
[Start Express server on port 3001]
      │
      ▼
[Register all API routes]
(/api/v1/movies, /api/v1/stream, /api/v1/admin, etc.)
      │
      ▼
[Start Next.js dev server on port 3000]
(or serve static export)
      │
      ▼
[Server Ready — Log: "MovieCloud running at http://localhost:3000"]
```

---

## 2. Library Scan Flow (Admin Triggered)

```
[Admin clicks "Scan Library" button]
      │
      ▼
[POST /api/v1/admin/scan]
      │
      ▼
[Create scan_log entry: status="running", type="full"]
      │
      ▼
[Connect to WD Cloud SMB/WebDAV]
      │
      ├─ FAIL → [Update scan_log: status="failed", error_message]
      │         [Return error to admin UI]
      │
      ▼ SUCCESS
[Read directory: Movies 2026/]
      │
      ▼
[For each genre folder (Action, Comedy, Drama, etc.)]
      │
      ▼
[For each video file in folder]
      │
      ▼
[Parse filename]
Extract: Title, Year, Quality, Audio, Subtitles, Source, Codec
Example: "Anora 2024 Dual Audio Hindi (ORG 5.1) 1080p WEB-DL x264 ESubs.mkv"
  → Title: "Anora", Year: 2024, Quality: "1080p", Audio: "Dual Audio Hindi (ORG 5.1)",
    Subtitles: true, Source: "WEB-DL", Codec: "x264"
      │
      ▼
[Generate slug ID]
"Anora 2024..." → slug: "anora-2024"
      │
      ▼
[Check: Does movie with this slug exist in DB?]
      │
      ├─ YES (update) → Compare file_hash
      │   ├─ Hash changed → Update file_size, file_hash, updated_at
      │   └─ Hash same   → Skip (no changes)
      │
      └─ NO (new) → [Check TMDB cache first]
                     │
                     ├─ CACHED → Use cached TMDB data
                     │
                     └─ NOT CACHED → [TMDB API: /search/movie?query=Anora&year=2024]
                                       │
                                       ├─ MATCH FOUND → [GET /movie/{tmdb_id}]
                                       │   → Save to tmdb_cache
                                       │   → Extract: synopsis, rating, poster, backdrop,
                                       │     cast, director, duration, genres
                                       │   → Download & cache poster to /public/posters/
                                       │   → Download & cache backdrop to /public/backdrops/
                                       │
                                       └─ NO MATCH → Use parsed filename data only
                                                    (title, year, quality)
                                                     Set tmdb_matched = 0
                                                     Use generic poster placeholder
      │
      ▼
[INSERT or UPDATE movies table]
      │
      ▼
[Link movie to genre(s)]
- Primary genre: from folder name (is_primary=1)
- Additional genres: from TMDB if matched (is_primary=0)
      │
      ▼
[Repeat for all files]
      │
      ▼
[Mark movies as inactive if file no longer exists on WD Cloud]
(is_active = 0)
      │
      ▼
[Update scan_log: status="completed", counts, completed_at]
      │
      ▼
[Return summary to admin: "23 new, 5 updated, 0 failed"]
```

---

## 3. User Journey: Browse & Watch

### 3.1 Landing on Homepage

```
[User opens moviecloud.com]
      │
      ▼
[Next.js renders homepage (SSR or CSR)]
      │
      ▼
[Parallel API calls:]
  ├─ GET /api/v1/movies/featured  → 5 featured movies (hero)
  ├─ GET /api/v1/movies?genre=action&limit=20 → Action row
  ├─ GET /api/v1/movies?genre=comedy&limit=20 → Comedy row
  ├─ GET /api/v1/movies?genre=drama&limit=20  → Drama row
  ├─ ... (one call per genre row)
  ├─ GET /api/v1/movies/recent?limit=20  → Recently Added row
  └─ GET /api/v1/movies/popular?limit=20 → Popular row
      │
      ▼
[Page renders with skeleton loaders first]
      │
      ▼
[Data arrives → Skeletons replaced with actual movie cards]
      │
      ▼
[Hero banner starts auto-rotation (8s interval)]
      │
      ▼
[User sees: Hero + 8-10 genre rows of movie posters]
```

### 3.2 Searching for a Movie

```
[User clicks search bar in header]
      │
      ▼
[Search bar expands, placeholder: "Search movies..."]
      │
      ▼
[User types: "john"]
      │
      ▼
[300ms debounce timer starts]
      │
      ▼
[After 300ms, if no more keystrokes:]
      │
      ▼
[GET /api/v1/movies/search?q=john]
      │
      ▼
[Backend query:]
SELECT * FROM movies
WHERE MATCH(title, original_title) AGAINST('john' IN BOOLEAN MODE)
   OR title LIKE '%john%'
ORDER BY rating DESC, year DESC
LIMIT 6
      │
      ▼
[Dropdown appears with top 6 results]
Each result shows: poster thumbnail + title + year + rating + genres
      │
      ▼
[User continues typing: "john wick"]
      │
      ▼
[Debounced GET /api/v1/movies/search?q=john+wick]
      │
      ▼
[Dropdown updates with refined results]
      │
      ├── User clicks a result → Navigate to /movie/john-wick-2014
      │
      ├── User presses Enter → Navigate to /search?q=john+wick (full results page)
      │
      └── User presses Escape → Close dropdown, clear search
```

### 3.3 Clicking a Movie Card

```
[User hovers over movie card in a row]
      │
      ▼
[Card scales to 1.08x, lifts up 8px, shadow increases]
[After 200ms, info panel fades in below poster]
[Shows: title, rating, genres, duration, Play/Info/List buttons]
      │
      ├── User clicks "▶ Play" → Jump to streaming flow (3.4)
      │
      ├── User clicks "ℹ Info" → Navigate to /movie/anora-2024
      │
      └── User clicks "+ List" → Toggle my-list in localStorage
                               [Heart icon toggles red/outline]
                               [Toast: "Added to My List" / "Removed from My List"]
```

### 3.4 Viewing Movie Detail Page

```
[User navigates to /movie/anora-2024]
      │
      ▼
[GET /api/v1/movies/anora-2024]
      │
      ▼
[Page renders:]
  - Full-width backdrop at top (50vh) with gradient overlay
  - Small poster overlapping backdrop
  - Title, year, rating, genres, duration
  - Synopsis
  - Cast & director
  - Technical info (quality, audio, subtitles, file size)
  - "Play Now" button (large, red)
  - "+ My List" button
  - "Share" button
  - Similar movies row
      │
      ▼
[User clicks "▶ Play Now"]
      │
      ▼
[Navigate to /watch/anora-2024]
(→ Streaming flow 3.5)
```

### 3.5 Streaming a Movie (Core Flow)

```
[User clicks "Play Now" on detail page or card]
      │
      ▼
[Navigate to /watch/anora-2024]
      │
      ▼
[GET /api/v1/movies/anora-2024] (if not already loaded)
      │
      ▼
[Check localStorage for saved progress]
      │
      ├── Progress found → Set start time
      │
      └── No progress → Start from 0:00
      │
      ▼
[Initialize Video.js player]
      │
      ▼
[Set video source: /api/v1/stream/anora-2024]
      │
      ▼
[Browser sends: GET /api/v1/stream/anora-2024]
      │
      ▼
[Backend receives request]
      │
      ▼
[Lookup movie in DB → get file_path: "Animation/Anora 2024...mkv"]
      │
      ▼
[Construct full path: /mnt/wdcloud/Movies 2026/Animation/Anora 2024...mkv]
      │
      ▼
[statSync() → get file size: 2,147,483,648 bytes]
      │
      ▼
[No Range header → Return full stream]
  OR
[Range: bytes=0-1048575 → Return first 1MB chunk (206 Partial Content)]
      │
      ▼
[createReadStream(path, { start, end }).pipe(res)]
      │
      ▼
[Browser receives video data]
      │
      ▼
[Video.js buffers first few seconds → Playback begins]
      │
      ▼
[POST /api/v1/view-logs (or backend auto-logs)]
  - Log: movie_id, viewer_ip, user_agent, started_at
  - Call: increment_view_count(movie_id) stored procedure
      │
      ▼
[During playback:]
  - Every 10 seconds → Save progress to localStorage
  - Video.js emits timeupdate events
  - Progress bar updates in real-time
      │
      ├── User seeks → Browser sends new Range request
      │   → Backend reads from that byte offset
      │   → No re-buffer from start
      │
      ├── User pauses → Progress saved to localStorage
      │
      ├── User exits → Final progress saved
      │   → View log updated: ended_at, progress_seconds, completed
      │
      └── Movie ends (100%) → completed = 1
          → Progress removed from localStorage
          → Movie moves out of "Continue Watching"
```

### 3.6 Seeking in Video (Range Request Detail)

```
[User clicks on progress bar at 50% mark of a 2GB file]
      │
      ▼
[Video.js calculates byte position: ~1,073,741,824]
      │
      ▼
[Browser sends: GET /api/v1/stream/anora-2024]
  Headers:
    Range: bytes=1073741824-
      │
      ▼
[Backend parses Range header:]
  start = 1073741824
  end = 2147483647 (file_size - 1)
  chunkSize = 1073741824
      │
      ▼
[Response Headers:]
  Status: 206 Partial Content
  Content-Range: bytes 1073741824-2147483647/2147483648
  Content-Length: 1073741824
  Content-Type: video/x-matroska
  Accept-Ranges: bytes
      │
      ▼
[Backend: createReadStream(path, { start: 1073741824 }).pipe(res)]
      │
      ▼
[Video resumes from ~50% instantly (no re-download of earlier data)]
```

---

## 4. Admin Flow

### 4.1 Library Scan (Admin)

```
[Admin navigates to /admin]
      │
      ▼
[Simple password gate (from .env ADMIN_PASSWORD)]
      │
      ├── Correct → Show admin dashboard
      └── Wrong   → "Access denied" message
      │
      ▼
[Admin Dashboard shows:]
  - Total movies count
  - Movies by genre (bar chart)
  - Storage used
  - Last scan info (time, status, counts)
  - Recent view activity
      │
      ▼
[Admin clicks "Scan Library"]
      │
      ▼
[POST /api/v1/admin/scan]
      │
      ▼
[Scan runs (see Flow #2 above)]
      │
      ▼
[Progress shown in admin UI:]
  - "Scanning... Found 142 movies so far"
  - Uses Server-Sent Events (SSE) for real-time updates
  - Or: Polling every 2 seconds
      │
      ▼
[Scan completes → Summary toast:]
  "Scan complete: 23 new, 5 updated, 142 total"
```

### 4.2 Managing a Movie (Admin)

```
[Admin clicks a movie in admin list]
      │
      ▼
[Edit modal/panel shows:]
  - Current metadata (editable)
  - TMDB match status
  - File path and size
  - View count and history
      │
      ├── "Refresh TMDB Data" → Re-fetch from TMDB API
      │   → Update poster, synopsis, rating, cast
      │
      ├── "Toggle Featured" → Set featured = 1 or 0
      │   → Movie appears/disappears from hero banner
      │
      └── "Delete from DB" → Remove movie record
          (File stays on WD Cloud, just hidden from site)
```

---

## 5. Data Flow Diagrams

### 5.1 TMDB Metadata Enrichment Flow

```
┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Filename Parser │────►│ TMDB Cache   │────►│ TMDB API     │
│                  │     │ (MySQL)      │     │ (External)   │
│ Input:           │     │              │     │              │
│ "Anora 2024      │     │ Check:       │     │ /search/movie│
│  Dual Audio...   │     │ query_title  │     │ ?query=Anora │
│  .mkv"           │     │ = "Anora"    │     │ &year=2024   │
│                  │     │ query_year   │     │              │
│ Output:          │     │ = 2024       │     │ Response:    │
│ title="Anora"   │     │              │     │ id, poster,  │
│ year=2024        │     ├─ HIT  ──────►│     │ synopsis,    │
│ quality="1080p"  │     │              │     │ rating, etc. │
│ audio="Dual..."  │     └─ MISS ──────►│     │              │
│ subs=true        │     │              │     └──────┬───────┘
└──────────────────┘     └──────────────┘            │
                                                    │
                         ┌──────────────┐            │
                         │ Image Cache  │◄───────────┘
                         │ (Local FS)   │
                         │              │     Download poster_path
                         │ /public/     │     and backdrop_path
                         │  posters/    │     from TMDB image CDN
                         │  backdrops/  │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Movies Table │
                         │ (MySQL)      │
                         │              │
                         │ Update with: │
                         │ - synopsis   │
                         │ - rating     │
                         │ - poster_url │
                         │ - backdrop   │
                         │ - cast       │
                         │ - director   │
                         │ - duration   │
                         │ - tmdb_id    │
                         └──────────────┘
```

### 5.2 Video Streaming Proxy Flow

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Browser  │       │ Next.js/     │       │ Express API  │       │ WD Cloud NAS │
│ (Client) │       │ Frontend     │       │ (Backend)    │       │ (Local)      │
└────┬─────┘       └──────┬───────┘       └──────┬───────┘       └──────┬───────┘
     │                    │                      │                      │
     │ GET /watch/id      │                      │                      │
     │ (page load)        │                      │                      │
     ├───────────────────►│                      │                      │
     │                    │                      │                      │
     │ <video src="/api/v1/stream/id">          │                      │
     │                    │                      │                      │
     │ GET /api/v1/stream/id                     │                      │
     │ Range: bytes=0-1048575                    │                      │
     ├───────────────────────────────────────────►│                      │
     │                    │                      │                      │
     │                    │                      │ Query DB for file    │
     │                    │                      │ path                  │
     │                    │                      ├─────────────────────►│
     │                    │                      │ statSync(path)       │
     │                    │                      │◄─────────────────────┤
     │                    │                      │ file_size, type      │
     │                    │                      │                      │
     │                    │                      │ createReadStream     │
     │                    │                      │ (path, {start, end}) │
     │                    │                      ├─────────────────────►│
     │                    │                      │                      │
     │ 206 Partial Content│                      │  ◄── bytes flow ────┤
     │ Content-Range:     │                      │                      │
     │  bytes 0-...       │◄─────────────────────┤                      │
     │                    │                      │                      │
     │ <video plays>      │                      │                      │
     │                    │                      │                      │
     │ User seeks to 50%  │                      │                      │
     │ Range: bytes=1GB-  │                      │                      │
     ├───────────────────────────────────────────►│                      │
     │                    │                      │ createReadStream     │
     │                    │                      │ (path, {start:1GB})  │
     │ 206 Partial Content│◄─────────────────────┤                      │
     │ (video resumes)    │                      │                      │
```

### 5.3 Image Proxy & Cache Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Browser  │     │ Express API  │     │ Local FS     │     │ TMDB CDN │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                    │                  │
     │ <img src="/api/v1/image/poster/anora-2024">             │
     ├─────────────────►│                    │                  │
     │                  │                    │                  │
     │                  │ Check local cache: │                  │
     │                  │ /public/posters/anora-2024.jpg       │
     │                  ├───────────────────►│                  │
     │                  │                    │                  │
     │                  │    ┌─ FILE EXISTS ──┤                  │
     │                  │    │  Return cached  │                 │
     │    200 OK        │    │  image          │                 │
     │    <image data>  │◄───┤                │                 │
     │◄─────────────────┤    │                │                 │
     │                  │    │                │                 │
     │                  │    └─ NOT FOUND ────┤                 │
     │                  │       Look up TMDB  │                 │
     │                  │       poster_path   │                 │
     │                  │       from DB       │                 │
     │                  │                    │                  │
     │                  │ Download from TMDB:│                  │
     │                  │ image.tmdb.org/t/p/w500/abc.jpg      │
     │                  ├───────────────────────────────────────►│
     │                  │                    │   <image data>   │
     │                  │◄───────────────────────────────────────┤
     │                  │                    │                  │
     │                  │ Resize with Sharp  │                  │
     │                  │ (w200 + w500)      │                  │
     │                  ├───────────────────►│                  │
     │                  │   Save to cache    │                  │
     │                  │                    │                  │
     │ 200 OK           │                    │                  │
     │ <optimized image>│                    │                  │
     │◄─────────────────┤                    │                  │
```

---

## 6. Error Handling Flows

### 6.1 Stream Unavailable

```
[User clicks Play]
      │
      ▼
[GET /api/v1/stream/nonexistent-id]
      │
      ▼
[Movie not found in DB → 404]
      │
      ▼
[Frontend shows error overlay on player:]
  "This movie is not available"
  [← Back to Browse]  [🔄 Try Again]
```

### 6.2 WD Cloud Offline

```
[User clicks Play]
      │
      ▼
[Backend tries to read file from /mnt/wdcloud/...]
      │
      ▼
[ENOENT or EHOSTUNREACH → Stream fails]
      │
      ▼
[Backend returns 503 Service Unavailable]
  { error: "Storage is temporarily unavailable" }
      │
      ▼
[Frontend shows:]
  "Unable to connect to the movie server.
   The storage device might be offline.
   Please try again in a few minutes."
  [🔄 Retry]  [← Back to Home]
```

### 6.3 TMDB API Rate Limit

```
[Admin triggers scan → TMDB calls]
      │
      ▼
[TMDB returns 429 Too Many Requests]
      │
      ▼
[Backend waits 1 second (respect Retry-After header)]
      │
      ▼
[Retry the same request]
      │
      ├── SUCCESS → Continue scan
      │
      └─ FAIL again → Skip this movie, log warning
          "TMDB rate limit hit. Movie 'X' skipped. Run scan again later."
          Set tmdb_matched = 0 for this movie
```

---

## 7. State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT STATE                             │
│                   (React Context / Zustand)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Server State (from API):                                   │
│  - movies[]           → All fetched movie data              │
│  - featuredMovies[]   → Hero banner movies                  │
│  - genres[]           → Genre list with counts              │
│  - searchResults[]    → Current search results              │
│  - pagination{}       → Current page, total, etc.           │
│                                                             │
│  UI State:                                                   │
│  - isHeaderScrolled   → Header background opacity           │
│  - isSearchOpen       → Search dropdown visibility          │
│  - isMobileMenuOpen   → Mobile nav drawer                   │
│  - isLoading          → Global loading state                │
│  - activeGenre        → Currently viewed genre filter       │
│  - sortBy             → Current sort option                 │
│                                                             │
│  Persistent State (localStorage):                           │
│  - myList[]           → Saved movie IDs                     │
│  - watchProgress{}    → { [movieId]: secondsWatched }       │
│  - recentSearches[]   → Last 10 search queries              │
│  - heroIndex          → Last viewed hero slide              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Route Map

```
/                           → Homepage (hero + genre rows)
/genre/[slug]               → Genre page (e.g., /genre/action)
/movie/[id]                 → Movie detail page
/watch/[id]                 → Video player page (full experience)
/search                     → Search results page (?q=query)
/my-list                    → Saved movies page
/admin                      → Admin dashboard (password protected)
/admin/scan                 → Admin: trigger scan (redirects to /admin)
/api/v1/*                   → Backend API (all endpoints)
/health                     → Health check page (optional)
/not-found                  → Custom 404 page
```

---

## 9. Component Tree

```
<App>
├── <Layout>
│   ├── <Header>
│   │   ├── <Logo />
│   │   ├── <NavLinks /> (Home, Genres dropdown, My List)
│   │   ├── <SearchBar />
│   │   │   └── <SearchDropdown />
│   │   └── <MobileMenuToggle />
│   ├── <MobileNavDrawer />
│   ├── <main>
│   │   ├── [Homepage]
│   │   │   ├── <HeroBanner />
│   │   │   │   └── <HeroSlide /> (×5)
│   │   │   ├── <ContinueWatchingRow />
│   │   │   │   └── <MovieCard /> (with progress bar)
│   │   │   ├── <MovieRow title="Action Movies">
│   │   │   │   ├── <MovieCard /> (×N)
│   │   │   │   └── <RowArrows />
│   │   │   └── ... (more rows)
│   │   │
│   │   ├── [Genre Page]
│   │   │   ├── <GenreHeader />
│   │   │   ├── <SortFilterBar />
│   │   │   └── <MovieGrid>
│   │   │       └── <MovieCard /> (×N)
│   │   │
│   │   ├── [Movie Detail]
│   │   │   ├── <MovieBackdrop />
│   │   │   ├── <MovieInfo />
│   │   │   ├── <MovieActions />
│   │   │   ├── <MovieMeta />
│   │   │   ├── <SimilarMovies>
│   │   │   │   └── <MovieCard /> (×N)
│   │   │   └── <CastList />
│   │   │
│   │   ├── [Watch Page]
│   │   │   ├── <VideoPlayer />
│   │   │   │   └── <PlayerControls />
│   │   │   └── <PlayerErrorOverlay />
│   │   │
│   │   ├── [Search Page]
│   │   │   ├── <SearchHeader />
│   │   │   ├── <SearchFilters />
│   │   │   └── <SearchResults>
│   │   │       └── <MovieCard /> (×N)
│   │   │
│   │   ├── [My List]
│   │   │   ├── <MyListHeader />
│   │   │   ├── <MyListGrid>
│   │   │   │   └── <MovieCard /> (×N)
│   │   │   └── <EmptyState />
│   │   │
│   │   └── [Admin]
│   │       ├── <AdminLoginGate />
│   │       ├── <AdminDashboard />
│   │       ├── <MovieTable />
│   │       └── <ScanProgress />
│   │
│   └── <MobileBottomNav />
├── <Footer />
└── <ToastContainer />
```

---

## 10. Page Load Waterfall (Homepage)

```
Time (ms)   Action
─────────────────────────────────────────────────
0           Browser requests /
0-50        DNS + TCP + TLS (or instant if local)
50-200      Next.js server renders HTML (SSR)
200-400     HTML arrives, browser starts parsing
200-500     Critical CSS loaded (inline or <link>)
200-600     JavaScript bundle loaded & parsed
400-800     React hydrates
600-900     API calls fired in parallel:
              - /api/v1/movies/featured
              - /api/v1/movies?genre=action
              - /api/v1/movies?genre=comedy
              - /api/v1/movies?genre=drama
              - ... (all genre rows)
              - /api/v1/movies/recent
              - /api/v1/movies/popular
800-1200    API responses arrive (from local MySQL, very fast)
1200-1500   Movie cards render with skeleton → real data transition
1200-2000   Poster images load (from local cache or TMDB CDN)
1500-2500   Hero backdrop loads, page feels complete
2500+       Background: remaining poster images lazy-load

Target: Visually complete (hero + first 2 rows) in < 2 seconds
```