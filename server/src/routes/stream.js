const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('../db/connection');
const wdcloud = require('../services/wdcloud');

// Local mode config
const WD_CLOUD_HOST = process.env.WD_CLOUD_HOST || '10.65.1.150';
const WD_CLOUD_SHARE = process.env.WD_CLOUD_SHARE || 'trailermaster786';
const WD_MOVIES_PATH = process.env.WD_CLOUD_MOVIES_PATH || 'Movies 2026';
const WD_MOUNT_POINT = process.env.WD_MOUNT_POINT || `\\\\${WD_CLOUD_HOST}\\${WD_CLOUD_SHARE}`;

function getMimeType(ext) {
  const mimeTypes = {
    '.mkv': 'video/x-matroska',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.wmv': 'video/x-ms-wmv',
    '.mov': 'video/quicktime',
    '.flv': 'video/x-flv',
    '.webm': 'video/webm',
  };
  return mimeTypes[ext] || 'video/mp4';
}

/**
 * Find movie file - local or remote
 */
async function findMovieFile(movie) {
  if (wdcloud.isRemoteMode()) {
    // Remote mode: use WD Cloud REST API
    const fileId = await wdcloud.findMovieFile(movie.file_path);
    if (!fileId) return null;
    return { type: 'remote', fileId: fileId.id, fileName: fileId.name };
  } else {
    // Local mode: use SMB/local filesystem
    const { existsSync, statSync } = require('fs');
    const pathsToTry = [
      path.join(WD_MOUNT_POINT, WD_MOVIES_PATH, movie.file_path),
      path.join(WD_MOUNT_POINT, movie.file_path),
      movie.file_path,
    ];

    for (const tryPath of pathsToTry) {
      if (existsSync(tryPath)) {
        const stat = statSync(tryPath);
        return { type: 'local', fullPath: tryPath, size: stat.size };
      }
    }
    return null;
  }
}

/**
 * Stream file from local filesystem with Range support
 */
function streamLocal(fullPath, fileSize, movie, res, req) {
  const range = req.headers.range;
  const contentType = getMimeType(path.extname(movie.file_name).toLowerCase());

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });

    const { createReadStream } = require('fs');
    createReadStream(fullPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    });

    const { createReadStream } = require('fs');
    createReadStream(fullPath).pipe(res);
  }
}

/**
 * Stream file from WD Cloud REST API with Range support
 */
async function streamRemote(fileId, movie, res, req) {
  const range = req.headers.range || null;
  const contentType = getMimeType(path.extname(movie.file_name).toLowerCase());

  const result = await wdcloud.streamFile(fileId, range);

  if (range) {
    // WD API returns 206 for range requests
    res.writeHead(206, {
      'Content-Range': result.headers['content-range'] || `bytes 0-0/*`,
      'Accept-Ranges': 'bytes',
      'Content-Length': result.headers['content-length'] || 0,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
  } else {
    res.writeHead(200, {
      'Content-Length': result.headers['content-length'] || 0,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    });
  }

  result.stream.pipe(res);
}

/**
 * Log view asynchronously
 */
function logView(movie, req) {
  pool.query('UPDATE movies SET view_count = view_count + 1 WHERE id = ?', [movie.id]).catch(() => {});
  pool.query(
    'INSERT INTO view_logs (movie_id, viewer_ip, user_agent, started_at) VALUES (?, ?, ?, NOW())',
    [movie.id, req.ip, req.headers['user-agent']]
  ).catch(() => {});
}

// GET /api/v1/stream/:id - Stream movie
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ? AND is_active = 1', [id]);

    if (movies.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = movies[0];
    const file = await findMovieFile(movie);

    if (!file) {
      return res.status(503).json({ error: 'Movie file not available on storage' });
    }

    if (file.type === 'local') {
      streamLocal(file.fullPath, file.size, movie, res, req);
    } else {
      await streamRemote(file.fileId, movie, res, req);
    }

    logView(movie, req);
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

// HEAD /api/v1/stream/:id - Get stream metadata
router.head('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ? AND is_active = 1', [id]);

    if (movies.length === 0) {
      return res.status(404).end();
    }

    const movie = movies[0];
    const file = await findMovieFile(movie);

    if (!file) {
      return res.status(503).end();
    }

    if (file.type === 'local') {
      res.writeHead(200, {
        'Content-Length': file.size,
        'Content-Type': getMimeType(path.extname(movie.file_name).toLowerCase()),
        'Accept-Ranges': 'bytes',
      });
    } else {
      // For remote files, get metadata from API
      const meta = await wdcloud.getFileById(file.fileId);
      res.writeHead(200, {
        'Content-Length': meta.size || 0,
        'Content-Type': getMimeType(path.extname(movie.file_name).toLowerCase()),
        'Accept-Ranges': 'bytes',
      });
    }

    res.end();
  } catch (error) {
    console.error('Stream head error:', error);
    res.status(500).end();
  }
});

module.exports = router;
