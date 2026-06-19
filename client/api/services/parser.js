/**
 * Filename Parser for MovieCloud
 * Parses movie filenames to extract metadata
 */

const path = require('path');

const VIDEO_EXTENSIONS = ['.mkv', '.mp4', '.avi', '.wmv', '.mov'];

/**
 * Parse a movie filename to extract metadata
 * @param {string} filename - The original filename
 * @param {string} folderName - The parent folder name (genre)
 * @returns {object|null} - Parsed filename data or null if not a video
 */
function parseFilename(filename, folderName = null) {
  const ext = path.extname(filename).toLowerCase();
  
  if (!VIDEO_EXTENSIONS.includes(ext)) {
    return null;
  }

  const nameWithoutExt = path.basename(filename, ext);
  
  // Extract year (4 digits)
  const yearMatch = nameWithoutExt.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : null;
  
  // Extract quality
  const qualityMatch = nameWithoutExt.match(/\b(4K|2160p|1080p|720p|480p)\b/i);
  const quality = qualityMatch ? qualityMatch[0].toUpperCase() : null;
  
  // Extract audio info (e.g., "Dual Audio Hindi (ORG 5.1)")
  const audioMatch = nameWithoutExt.match(/(Dual Audio[^[]*|[\[]?Audio[^[]*[\]]?|5\.1|7\.1|Dolby[^[]*|AAC|DTS|FLAC)/i);
  const audioInfo = audioMatch ? audioMatch[0].trim() : null;
  
  // Extract subtitles
  const hasSubtitles = /ESubs|Subs|Subbed|SUB/i.test(nameWithoutExt);
  
  // Extract source
  const sourceMatch = nameWithoutExt.match(/(WEB-?DL|WEB-?RIP|BluRay|BRRip|HDRip|DVDRip|HDTV|CAM|TS)/i);
  const source = sourceMatch ? sourceMatch[1] : null;
  
  // Extract codec
  const codecMatch = nameWithoutExt.match(/(x264|x265|HEVC|H\.?264|H\.?265|AVC|VP9|AV1)/i);
  const codec = codecMatch ? codecMatch[1] : null;
  
  // Extract title (everything before the year or quality)
  let title = nameWithoutExt;
  
  // Remove common patterns from the end
  const patternsToRemove = [
    /\b\d{4}\b/, // year
    /\b(4K|2160p|1080p|720p|480p)\b/i, // quality
    /\b(Dual Audio[^[]*|Audio[^[]*)/i, // audio
    /\b(ESubs|Subs|Subbed|SUB)\b/i, // subtitles
    /\b(WEB-?DL|WEB-?RIP|BluRay|BRRip|HDRip|DVDRip|HDTV|CAM|TS)\b/i, // source
    /\b(x264|x265|HEVC|H\.?264|H\.?265|AVC|VP9|AV1)\b/i, // codec
    /\[[^\]]*\]/g, // bracket contents
  ];
  
  patternsToRemove.forEach(pattern => {
    title = title.replace(pattern, ' ');
  });
  
  // Clean up title
  title = title
    .replace(/[\s._-]+/g, ' ') // Replace dots, underscores, hyphens with spaces
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
  
  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .trim('-');
  
  // Add year to slug if available
  const slugWithYear = year ? `${slug}-${year}` : slug;
  
  return {
    title,
    year,
    quality,
    audioInfo,
    hasSubtitles,
    source,
    codec,
    slug: slugWithYear,
    extension: ext,
    originalFilename: filename,
    folderName,
  };
}

/**
 * Check if a file is a video file
 * @param {string} filename - The filename to check
 * @returns {boolean}
 */
function isVideoFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

module.exports = {
  parseFilename,
  isVideoFile,
  VIDEO_EXTENSIONS,
};
