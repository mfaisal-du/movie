/**
 * WD Cloud Scanner Service for MovieCloud
 * Scans WD Cloud NAS for movies and enriches metadata
 * Supports both local (SMB) and remote (REST API) modes
 */

const path = require('path');
const { parseFilename, isVideoFile } = require('./parser');
const { enrichMovie } = require('./tmdb');
const pool = require('../db/connection');
const wdcloud = require('./wdcloud');

// Local mode config
const WD_CLOUD_HOST = process.env.WD_CLOUD_HOST || '10.65.1.150';
const WD_CLOUD_SHARE = process.env.WD_CLOUD_SHARE || 'trailermaster786';
const WD_MOVIES_PATH = process.env.WD_CLOUD_MOVIES_PATH || 'Movies 2026';
const WD_MOUNT_POINT = process.env.WD_MOUNT_POINT || `\\\\${WD_CLOUD_HOST}\\${WD_CLOUD_SHARE}`;

/**
 * Get genre folders (local or remote)
 */
async function getGenreFolders() {
  if (wdcloud.isRemoteMode()) {
    // Remote mode: use WD Cloud REST API
    const moviesFolderId = await wdcloud.getFolderIdByPath(WD_MOVIES_PATH);
    if (!moviesFolderId) {
      throw new Error(`Movies directory not found on WD Cloud: ${WD_MOVIES_PATH}`);
    }
    const items = await wdcloud.listFiles(moviesFolderId);
    return items
      .filter(item => item.mimeType === 'application/x.wd.dir')
      .map(item => ({ id: item.id, name: item.name, type: 'remote' }));
  } else {
    // Local mode: use filesystem
    const fs = require('fs');
    const moviesDir = path.join(WD_MOUNT_POINT, WD_MOVIES_PATH);
    
    if (!fs.existsSync(moviesDir)) {
      throw new Error(`Movies directory not found: ${moviesDir}`);
    }

    const entries = fs.readdirSync(moviesDir, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => ({ name: e.name, type: 'local' }));
  }
}

/**
 * Get video files in a genre folder (local or remote)
 */
async function getVideoFiles(folder) {
  if (folder.type === 'remote') {
    // Remote mode
    const items = await wdcloud.listFiles(folder.id);
    return items
      .filter(item => item.mimeType !== 'application/x.wd.dir' && isVideoFile(item.name))
      .map(item => ({
        name: item.name,
        id: item.id,
        size: item.size,
        type: 'remote',
      }));
  } else {
    // Local mode
    const fs = require('fs');
    const moviesDir = path.join(WD_MOUNT_POINT, WD_MOVIES_PATH);
    const folderPath = path.join(moviesDir, folder.name);
    const files = fs.readdirSync(folderPath);
    
    return files
      .filter(file => isVideoFile(file))
      .map(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          fullPath: filePath,
          size: stats.size,
          type: 'local',
        };
      });
  }
}

/**
 * Scan the entire movie library
 * @param {string} type - 'full' or 'incremental'
 * @returns {Promise<object>} - Scan results
 */
async function scanLibrary(type = 'full') {
  const scanLog = {
    type,
    status: 'running',
    totalFound: 0,
    totalNew: 0,
    totalUpdated: 0,
    totalFailed: 0,
    errors: [],
  };

  let scanId = null;
  const accessMode = wdcloud.isRemoteMode() ? 'remote (WD Cloud API)' : 'local (SMB)';

  try {
    console.log(`Starting ${type} scan in ${accessMode} mode...`);

    // Create scan log entry
    const [result] = await pool.query(
      `INSERT INTO scan_logs (scan_type, status) VALUES (?, 'running')`,
      [type]
    );
    scanId = result.insertId;

    // Get genre folders
    const genreFolders = await getGenreFolders();
    console.log(`Found ${genreFolders.length} genre folders`);

    // Process each genre folder
    for (const folder of genreFolders) {
      console.log(`Scanning genre: ${folder.name}...`);
      
      const videoFiles = await getVideoFiles(folder);
      
      for (const file of videoFiles) {
        scanLog.totalFound++;
        
        try {
          // Parse filename
          const parsed = parseFilename(file.name, folder.name);
          if (!parsed) {
            scanLog.totalFailed++;
            scanLog.errors.push(`Failed to parse: ${file.name}`);
            continue;
          }

          // Check if movie exists
          const [existing] = await pool.query(
            'SELECT id, poster_url, backdrop_url FROM movies WHERE id = ?',
            [parsed.slug]
          );

          const fileSize = file.size;

          if (existing.length === 0) {
            // New movie - enrich with TMDB/fallback sources
            const enriched = await enrichMovie(parsed);
            
            // Insert into database
            await pool.query(
              `INSERT INTO movies (id, title, year, quality, audio_info, has_subtitles, 
                file_path, file_name, file_size, synopsis, rating, poster_url, backdrop_url,
                trailer_url, cast, director, duration, language, tmdb_id, tmdb_matched)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                enriched.slug,
                enriched.title,
                enriched.year,
                enriched.quality,
                enriched.audioInfo,
                enriched.hasSubtitles ? 1 : 0,
                `${folder.name}/${file.name}`,
                file.name,
                fileSize,
                enriched.synopsis,
                enriched.rating,
                enriched.posterUrl,
                enriched.backdropUrl,
                enriched.trailerUrl,
                enriched.cast ? JSON.stringify(enriched.cast) : null,
                enriched.director,
                enriched.duration,
                enriched.language,
                enriched.tmdbId,
                enriched.tmdbMatched ? 1 : 0,
              ]
            );

            // Link to genre
            const [genre] = await pool.query(
              'SELECT id FROM genres WHERE slug = ?',
              [folder.name.toLowerCase().replace(/\s+/g, '-')]
            );

            if (genre.length > 0) {
              await pool.query(
                'INSERT INTO movie_genres (movie_id, genre_id, is_primary) VALUES (?, ?, 1)',
                [enriched.slug, genre[0].id]
              );
            }

            scanLog.totalNew++;
            console.log(`Added: ${enriched.title}`);
          } else {
            // Existing movie - try to update with images if missing OR if not TMDB matched
            const existingMovie = existing[0];
            
            if (!existingMovie.poster_url || !existingMovie.backdrop_url || !existingMovie.tmdb_matched) {
              const enriched = await enrichMovie(parsed);
              await pool.query(
                `UPDATE movies SET 
                  poster_url = ?,
                  backdrop_url = ?,
                  synopsis = COALESCE(synopsis, ?),
                  rating = COALESCE(rating, ?),
                  tmdb_id = COALESCE(tmdb_id, ?),
                  tmdb_matched = ?,
                  updated_at = NOW()
                 WHERE id = ?`,
                [enriched.posterUrl || existingMovie.poster_url, enriched.backdropUrl || existingMovie.backdrop_url, enriched.synopsis, enriched.rating, enriched.tmdbId, enriched.tmdbMatched ? 1 : 0, parsed.slug]
              );
              console.log(`Updated metadata for: ${parsed.title}`);
            }
            scanLog.totalUpdated++;
          }
        } catch (error) {
          scanLog.totalFailed++;
          scanLog.errors.push(`Error processing ${file.name}: ${error.message}`);
          console.error(`Error processing ${file.name}:`, error);
        }
      }
    }

    // Update scan log
    await pool.query(
      `UPDATE scan_logs SET 
        status = 'completed',
        total_found = ?,
        total_new = ?,
        total_updated = ?,
        total_failed = ?,
        error_message = ?,
        completed_at = NOW()
       WHERE id = ?`,
      [
        scanLog.totalFound,
        scanLog.totalNew,
        scanLog.totalUpdated,
        scanLog.totalFailed,
        scanLog.errors.length > 0 ? scanLog.errors.join('\n') : null,
        scanId,
      ]
    );

    console.log(`Scan complete: ${scanLog.totalNew} new, ${scanLog.totalUpdated} updated, ${scanLog.totalFailed} failed`);
    
    return {
      scanId,
      ...scanLog,
    };
  } catch (error) {
    console.error('Scan failed:', error);
    
    // Update scan log with failure
    if (scanId) {
      await pool.query(
        `UPDATE scan_logs SET status = 'failed', error_message = ? WHERE id = ?`,
        [error.message, scanId]
      );
    }
    
    throw error;
  }
}

module.exports = {
  scanLibrary,
};
