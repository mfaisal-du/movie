# Database Schema
## MovieCloud — MySQL (XAMPP, Port 3306)

---

## 1. Database Configuration

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=moviecloud
CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
```

---

## 2. Entity Relationship Diagram (Text)

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│    genres       │       │   movie_genres   │       │      movies         │
├─────────────────┤       ├──────────────────┤       ├─────────────────────┤
│ id (PK)         │──┐    │ movie_id (FK)    │──┐    │ id (PK)             │
│ name            │  └───►│ genre_id (FK)    │  └───►│ title               │
│ slug            │       └──────────────────┘       │ original_title      │
│ tmdb_id         │                                  │ year                │
│ created_at      │                                  │ duration            │
└─────────────────┘                                  │ synopsis            │
                                                     │ rating              │
┌─────────────────┐                                  │ poster_url          │
│   scan_logs     │                                  │ backdrop_url        │
├─────────────────┤                                  │ trailer_url         │
│ id (PK)         │                                  │ quality             │
│ scan_type       │                                  │ audio_info          │
│ status          │                                  │ has_subtitles       │
│ total_found     │                                  │ language            │
│ total_new       │                                  │ file_path           │
│ total_updated   │                                  │ file_name           │
│ total_failed    │                                  │ file_size           │
│ error_message   │                                  │ file_hash           │
│ started_at      │                                  │ tmdb_id             │
│ completed_at    │                                  │ tmdb_matched        │
│ created_at      │                                  │ cast                │
└─────────────────┘                                  │ director            │
                                                     │ view_count          │
┌─────────────────┐                                  │ featured            │
│  tmdb_cache     │                                  │ is_active           │
├─────────────────┤                                  │ added_at            │
│ id (PK)         │                                  │ updated_at          │
│ tmdb_id         │                                  └──────────┬──────────┘
│ movie_title     │                                             │
│ query_title     │                                  ┌──────────┴──────────┐
│ query_year      │                                  │   view_logs         │
│ response_json   │                                  ├─────────────────────┤
│ poster_path     │                                  │ id (PK)             │
│ backdrop_path   │                                  │ movie_id (FK)       │
│ fetched_at      │                                  │ viewer_ip           │
│ expires_at      │                                  │ user_agent          │
└─────────────────┘                                  │ started_at          │
                                                     │ ended_at            │
                                                     │ progress_seconds    │
                                                     │ completed           │
                                                     │ created_at          │
                                                     └─────────────────────┘

┌─────────────────┐
│   app_settings  │
├─────────────────┤
│ id (PK)         │
│ setting_key     │
│ setting_value   │
│ updated_at      │
└─────────────────┘
```

---

## 3. Table Definitions

### 3.1 `movies` — Main Movie Table

```sql
CREATE TABLE `movies` (
  `id` VARCHAR(255) NOT NULL COMMENT 'Slugified ID from filename, e.g., "2-guns-2013"',
  `title` VARCHAR(500) NOT NULL COMMENT 'Clean movie title, e.g., "2 Guns"',
  `original_title` VARCHAR(500) DEFAULT NULL COMMENT 'Original title if TMDB returns different one',
  `year` INT UNSIGNED DEFAULT NULL COMMENT 'Release year extracted from filename or TMDB',
  `duration` INT UNSIGNED DEFAULT NULL COMMENT 'Duration in minutes from TMDB',
  `synopsis` TEXT DEFAULT NULL COMMENT 'Movie description/overview from TMDB',
  `rating` DECIMAL(3, 1) DEFAULT NULL COMMENT 'TMDB vote_average (0.0 - 10.0)',
  `poster_url` VARCHAR(1000) DEFAULT NULL COMMENT 'Local path to cached poster image',
  `backdrop_url` VARCHAR(1000) DEFAULT NULL COMMENT 'Local path to cached backdrop image',
  `trailer_url` VARCHAR(1000) DEFAULT NULL COMMENT 'YouTube trailer URL from TMDB',
  `quality` VARCHAR(50) DEFAULT NULL COMMENT 'Resolution: 720p, 1080p, 4K — parsed from filename',
  `audio_info` VARCHAR(255) DEFAULT NULL COMMENT 'Audio details: "Dual Audio Hindi (ORG 5.1)" — parsed from filename',
  `has_subtitles` TINYINT(1) DEFAULT 0 COMMENT '1 if subtitle file (.srt, .vtt) exists alongside movie',
  `language` VARCHAR(100) DEFAULT NULL COMMENT 'Primary language from TMDB',
  `file_path` VARCHAR(1000) NOT NULL COMMENT 'Relative path from WD Cloud movies root: "Action/2 Guns 2013...mkv"',
  `file_name` VARCHAR(500) NOT NULL COMMENT 'Original filename from WD Cloud',
  `file_size` BIGINT UNSIGNED DEFAULT NULL COMMENT 'File size in bytes',
  `file_hash` VARCHAR(64) DEFAULT NULL COMMENT 'SHA-256 hash for change detection',
  `tmdb_id` INT UNSIGNED DEFAULT NULL COMMENT 'TMDB movie ID for API reference',
  `tmdb_matched` TINYINT(1) DEFAULT 0 COMMENT '1 if successfully matched to TMDB',
  `cast` JSON DEFAULT NULL COMMENT 'Array of cast member names from TMDB',
  `director` VARCHAR(500) DEFAULT NULL COMMENT 'Director name from TMDB',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT 'Total number of times streamed',
  `featured` TINYINT(1) DEFAULT 0 COMMENT '1 if shown in hero banner rotation',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '0 if movie file was removed from WD Cloud',
  `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When first scanned/added',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last metadata update',
  PRIMARY KEY (`id`),
  INDEX `idx_year` (`year`),
  INDEX `idx_rating` (`rating`),
  INDEX `idx_view_count` (`view_count` DESC),
  INDEX `idx_featured` (`featured`, `is_active`),
  INDEX `idx_added_at` (`added_at` DESC),
  INDEX `idx_tmdb_id` (`tmdb_id`),
  INDEX `idx_is_active` (`is_active`),
  FULLTEXT INDEX `ft_title` (`title`, `original_title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movie catalog — metadata for all movies on WD Cloud';
```

### 3.2 `genres` — Genre Master List

```sql
CREATE TABLE `genres` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT 'Display name: "Action", "Comedy", etc.',
  `slug` VARCHAR(50) NOT NULL COMMENT 'URL-friendly: "action", "comedy", etc.',
  `tmdb_id` INT UNSIGNED DEFAULT NULL COMMENT 'TMDB genre ID for API mapping',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_slug` (`slug`),
  UNIQUE INDEX `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Genre categories';
```

### 3.3 `movie_genres` — Movie-to-Genre Junction (Many-to-Many)

```sql
CREATE TABLE `movie_genres` (
  `movie_id` VARCHAR(255) NOT NULL,
  `genre_id` INT UNSIGNED NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0 COMMENT '1 = folder-derived genre (primary), 0 = TMDB-added genre',
  PRIMARY KEY (`movie_id`, `genre_id`),
  INDEX `idx_genre_id` (`genre_id`),
  CONSTRAINT `fk_mg_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mg_genre` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Junction table: movies belong to multiple genres';
```

### 3.4 `scan_logs` — Library Scan History

```sql
CREATE TABLE `scan_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `scan_type` ENUM('full', 'incremental') NOT NULL DEFAULT 'full' COMMENT 'full = rescan all, incremental = new files only',
  `status` ENUM('running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'running',
  `total_found` INT UNSIGNED DEFAULT 0 COMMENT 'Total movie files found on WD Cloud',
  `total_new` INT UNSIGNED DEFAULT 0 COMMENT 'New movies added to DB',
  `total_updated` INT UNSIGNED DEFAULT 0 COMMENT 'Existing movies with updated metadata',
  `total_failed` INT UNSIGNED DEFAULT 0 COMMENT 'Movies that failed TMDB matching',
  `error_message` TEXT DEFAULT NULL COMMENT 'Error details if scan failed',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_started_at` (`started_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log of all library scan operations';
```

### 3.5 `tmdb_cache` — TMDB API Response Cache

```sql
CREATE TABLE `tmdb_cache` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tmdb_id` INT UNSIGNED DEFAULT NULL COMMENT 'TMDB movie ID (if matched)',
  `movie_title` VARCHAR(500) NOT NULL COMMENT 'Title returned by TMDB',
  `query_title` VARCHAR(500) NOT NULL COMMENT 'Title we searched for',
  `query_year` INT UNSIGNED DEFAULT NULL COMMENT 'Year we searched with',
  `response_json` JSON NOT NULL COMMENT 'Full TMDB API response for later use',
  `poster_path` VARCHAR(500) DEFAULT NULL COMMENT 'TMDB poster path (e.g., "/abc123.jpg")',
  `backdrop_path` VARCHAR(500) DEFAULT NULL COMMENT 'TMDB backdrop path',
  `fetched_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL COMMENT 'When cache entry becomes stale (7 days)',
  PRIMARY KEY (`id`),
  INDEX `idx_tmdb_id` (`tmdb_id`),
  INDEX `idx_query` (`query_title`, `query_year`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cache of TMDB API responses to reduce API calls';
```

### 3.6 `view_logs` — Movie Stream/View Analytics

```sql
CREATE TABLE `view_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `movie_id` VARCHAR(255) NOT NULL,
  `viewer_ip` VARCHAR(45) DEFAULT NULL COMMENT 'IP address (supports IPv6)',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT 'Browser user agent string',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When playback started',
  `ended_at` DATETIME DEFAULT NULL COMMENT 'When playback stopped (or last heartbeat)',
  `progress_seconds` INT UNSIGNED DEFAULT 0 COMMENT 'Farthest point watched in seconds',
  `completed` TINYINT(1) DEFAULT 0 COMMENT '1 if watched > 90% of duration',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_movie_id` (`movie_id`),
  INDEX `idx_started_at` (`started_at` DESC),
  INDEX `idx_viewer_ip` (`viewer_ip`),
  CONSTRAINT `fk_vl_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track movie views for analytics and "popular" ranking';
```

### 3.7 `app_settings` — Application Configuration

```sql
CREATE TABLE `app_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL COMMENT 'Unique config key',
  `setting_value` TEXT DEFAULT NULL COMMENT 'Config value (JSON for complex values)',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Key-value store for app configuration';
```

---

## 4. Seed Data

### 4.1 Genres (Matches WD Cloud Folder Structure)

```sql
INSERT INTO `genres` (`name`, `slug`, `tmdb_id`) VALUES
('Action', 'action', 28),
('Animation', 'animation', 16),
('Comedy', 'comedy', 35),
('Drama', 'drama', 18),
('Horror', 'horror', 27),
('Other', 'other', NULL),
('Sci-Fi', 'sci-fi', 878),
('Thriller', 'thriller', 53);
```

### 4.2 App Settings (Defaults)

```sql
INSERT INTO `app_settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'MovieCloud'),
('hero_rotation_interval', '8000'),
('hero_movie_count', '5'),
('movies_per_page', '20'),
('search_debounce_ms', '300'),
('tmdb_cache_ttl_days', '7'),
('poster_cache_dir', './public/posters'),
('backdrop_cache_dir', './public/backdrops'),
('admin_password', 'changeme'),
('stream_chunk_size', '1048576'),
('max_concurrent_streams', '5'),
('wd_cloud_host', '10.65.1.150'),
('wd_cloud_share', 'trailermaster786'),
('wd_cloud_movies_path', 'Movies 2026');
```

---

## 5. Useful Views

### 5.1 `v_movie_genres` — Movies with their genre names

```sql
CREATE OR REPLACE VIEW `v_movie_genres` AS
SELECT
  m.*,
  GROUP_CONCAT(DISTINCT g.name ORDER BY mg.is_primary DESC, g.name ASC) AS genre_names,
  GROUP_CONCAT(DISTINCT g.slug ORDER BY mg.is_primary DESC, g.slug ASC) AS genre_slugs,
  GROUP_CONCAT(DISTINCT g.id ORDER BY mg.is_primary DESC, g.id ASC) AS genre_ids
FROM movies m
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
WHERE m.is_active = 1
GROUP BY m.id;
```

### 5.2 `v_movie_stats` — Per-genre movie counts

```sql
CREATE OR REPLACE VIEW `v_movie_stats` AS
SELECT
  g.id AS genre_id,
  g.name AS genre_name,
  g.slug AS genre_slug,
  COUNT(DISTINCT mg.movie_id) AS movie_count,
  ROUND(AVG(m.rating), 1) AS avg_rating,
  SUM(m.view_count) AS total_views
FROM genres g
LEFT JOIN movie_genres mg ON g.id = mg.genre_id
LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
GROUP BY g.id, g.name, g.slug
ORDER BY movie_count DESC;
```

### 5.3 `v_popular_movies` — Movies sorted by views (for "Popular" row)

```sql
CREATE OR REPLACE VIEW `v_popular_movies` AS
SELECT
  m.id, m.title, m.year, m.rating, m.poster_url, m.quality, m.duration,
  m.view_count, m.featured, m.added_at,
  (SELECT GROUP_CONCAT(DISTINCT g.name) FROM movie_genres mg JOIN genres g ON mg.genre_id = g.id WHERE mg.movie_id = m.id) AS genres
FROM movies m
WHERE m.is_active = 1
ORDER BY m.view_count DESC
LIMIT 50;
```

---

## 6. Stored Procedures

### 6.1 Increment View Count

```sql
DELIMITER //
CREATE PROCEDURE `increment_view_count`(IN p_movie_id VARCHAR(255))
BEGIN
  UPDATE movies SET view_count = view_count + 1 WHERE id = p_movie_id;
END //
DELIMITER ;
```

### 6.2 Get Random Featured Movies

```sql
DELIMITER //
CREATE PROCEDURE `get_featured_movies`(IN p_count INT)
BEGIN
  SELECT m.id, m.title, m.year, m.rating, m.synopsis, m.duration,
         m.poster_url, m.backdrop_url, m.trailer_url, m.quality,
         (SELECT GROUP_CONCAT(DISTINCT g.name) FROM movie_genres mg JOIN genres g ON mg.genre_id = g.id WHERE mg.movie_id = m.id) AS genres
  FROM movies m
  WHERE m.is_active = 1 AND m.featured = 1
  ORDER BY RAND()
  LIMIT IFNULL(p_count, 5);
END //
DELIMITER ;
```

### 6.3 Clean Orphaned View Logs

```sql
DELIMITER //
CREATE PROCEDURE `clean_old_view_logs`(IN p_days INT)
BEGIN
  DELETE FROM view_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL IFNULL(p_days, 90) DAY);
END //
DELIMITER ;
```

---

## 7. Migration Script (Run Once)

Save this as `database/migrations/001_initial_schema.sql` and run via XAMPP phpMyAdmin or MySQL CLI:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS `moviecloud`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `moviecloud`;

-- Execute all CREATE TABLE statements from sections 3.1 through 3.7 above
-- Execute all INSERT statements from sections 4.1 and 4.2 above
-- Execute all CREATE VIEW statements from section 5 above
-- Execute all CREATE PROCEDURE statements from section 6 above
```

**Command to run:**
```bash
mysql -u root -p moviecloud < database/migrations/001_initial_schema.sql
```

**Or via XAMPP:**
1. Open `http://localhost/phpmyadmin`
2. Create database `moviecloud`
3. Go to Import tab
4. Upload `001_initial_schema.sql`

---

## 8. JSON Column Examples

### 8.1 `movies.cast` — JSON Array

```json
["Denzel Washington", "Mark Wahlberg", "Paula Patton", "Edward James Olmos"]
```

### 8.2 `tmdb_cache.response_json` — TMDB Full Response (abbreviated)

```json
{
  "id": 53314,
  "title": "2 Guns",
  "original_title": "2 Guns",
  "overview": "A DEA agent and a naval intelligence officer...",
  "release_date": "2013-08-02",
  "runtime": 109,
  "vote_average": 6.5,
  "vote_count": 2500,
  "poster_path": "/9DQ3Hq7XFKd1FIgKHrDWEFBCyHv.jpg",
  "backdrop_path": "/aq7FNz2zu2pVReGbD1S5MZomM65.jpg",
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 53, "name": "Thriller" }
  ],
  "credits": {
    "cast": [
      { "name": "Denzel Washington", "character": "Bobby" },
      { "name": "Mark Wahlberg", "character": "Stig" }
    ],
    "crew": [
      { "name": "Baltasar Kormakur", "job": "Director" }
    ]
  },
  "videos": {
    "results": [
      { "key": "example", "site": "YouTube", "type": "Trailer" }
    ]
  }
}
```

---

## 9. Index Strategy Summary

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `movies` | `PRIMARY` | BTREE | Slug ID lookup |
| `movies` | `idx_year` | BTREE | Filter/sort by year |
| `movies` | `idx_rating` | BTREE | Sort by rating |
| `movies` | `idx_view_count` | BTREE DESC | Popular movies query |
| `movies` | `idx_featured` | BTREE | Featured movie hero query |
| `movies` | `idx_added_at` | BTREE DESC | Recently added query |
| `movies` | `ft_title` | FULLTEXT | Title search |
| `genres` | `uk_slug` | UNIQUE | Genre page routing |
| `movie_genres` | `PRIMARY` | BTREE | Prevent duplicates |
| `movie_genres` | `fk_mg_movie` | FOREIGN KEY | Cascade delete |
| `movie_genres` | `fk_mg_genre` | FOREIGN KEY | Cascade delete |
| `tmdb_cache` | `idx_query` | BTREE | Cache lookup before TMDB call |
| `tmdb_cache` | `idx_expires` | BTREE | Cache cleanup |
| `view_logs` | `idx_movie_id` | BTREE | View count aggregation |
| `view_logs` | `idx_started_at` | BTREE DESC | Recent activity |

---

## 10. Backup Strategy

```bash
# Daily backup script (add to crontab)
mysqldump -u root moviecloud > /backups/moviecloud_$(date +%Y%m%d).sql

# Restore
mysql -u root moviecloud < /backups/moviecloud_20260614.sql
```