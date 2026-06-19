const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const pool = require('../db/connection');

const WD_CLOUD_HOST = process.env.WD_CLOUD_HOST || '10.65.1.150';
const WD_CLOUD_SHARE = process.env.WD_CLOUD_SHARE || 'trailermaster786';
const WD_MOVIES_PATH = process.env.WD_CLOUD_MOVIES_PATH || 'Movies 2026';
const WD_MOUNT_POINT = process.env.WD_MOUNT_POINT || `\\\\${WD_CLOUD_HOST}\\${WD_CLOUD_SHARE}`;

// GET /api/v1/subtitles/:id - Get subtitles for a movie
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    const movie = movies[0];
    const baseDir = path.join(WD_MOUNT_POINT, WD_MOVIES_PATH, movie.file_path);
    
    // Look for subtitle files
    const subtitlePatterns = ['.srt', '.vtt', '.ass', '.ssa'];
    const foundSubtitles = [];
    
    for (const ext of subtitlePatterns) {
      const srtPath = `${baseDir.replace(/\\/g, '/')}/${movie.file_name.replace(/\.[^.]+$/, '')}${ext}`;
      if (fs.existsSync(srtPath)) {
        foundSubtitles.push({
          language: 'English',
          url: `/api/v1/subtitles/file?path=${encodeURIComponent(srtPath)}`,
          format: ext.substring(1)
        });
      }
    }
    
    // Also check parent directory for separate subtitle folder
    const fileNameWithoutExt = movie.file_name.replace(/\.[^.]+$/, '');
    const subtitleDir = path.join(baseDir, fileNameWithoutExt);
    if (fs.existsSync(subtitleDir)) {
      const files = fs.readdirSync(subtitleDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (subtitlePatterns.includes(ext)) {
          const fullPath = path.join(subtitleDir, file);
          foundSubtitles.push({
            language: path.basename(file, ext).replace(/[._]/g, ' '),
            url: `/api/v1/subtitles/file?path=${encodeURIComponent(fullPath)}`,
            format: ext.substring(1)
          });
        }
      }
    }
    
    res.json({
      success: true,
      subtitles: foundSubtitles
    });
  } catch (error) {
    console.error('Subtitle fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subtitles' });
  }
});

// GET /api/v1/subtitles/file - Stream subtitle file
router.get('/file', async (req, res) => {
  try {
    const { path: subtitlePath } = req.query;
    
    if (!subtitlePath || typeof subtitlePath !== 'string') {
      return res.status(400).json({ error: 'Path required' });
    }
    
    // Security: Validate path is within allowed directory
    const decodedPath = decodeURIComponent(subtitlePath);
    const normalizedPath = path.normalize(decodedPath);
    
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: 'Subtitle not found' });
    }
    
    // Set appropriate content type
    const ext = path.extname(normalizedPath).toLowerCase();
    const contentTypes = {
      '.srt': 'text/plain',
      '.vtt': 'text/vtt',
      '.ass': 'text/plain',
      '.ssa': 'text/plain'
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const content = fs.readFileSync(normalizedPath, 'utf8');
    
    // Convert SRT to VTT if needed
    if (ext === '.srt') {
      const vttContent = 'WEBVTT\n\n' + content.replace(/\d+\r?\n(\d{2}:\d{2}:\d{2}),\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/g, 
        (match) => match.replace(/,/g, '.'));
      res.send(vttContent);
    } else {
      res.send(content);
    }
  } catch (error) {
    console.error('Subtitle file error:', error);
    res.status(500).json({ error: 'Failed to read subtitle file' });
  }
});

module.exports = router;