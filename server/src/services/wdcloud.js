/**
 * WD Cloud REST API Service
 * Provides remote file access to WD My Cloud NAS via WD's cloud relay
 * Works both locally (direct SMB) and remotely (REST API)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const WD_CLOUD_EMAIL = process.env.WD_CLOUD_EMAIL;
const WD_CLOUD_PASSWORD = process.env.WD_CLOUD_PASSWORD;

// Auth0 credentials (public, used by all WD My Cloud apps)
const AUTH0_CLIENT_ID = '9B0Gi617tROKHc2rS95sT1yJzR6MkQDm';
const AUTH0_CLIENT_SECRET = 'oSJOB1KOWnLVZm11DVknu2wZkTj5AGKxcINEDtEUPE30jHKvEqorM8ocWbyo17Hd';
const AUTH0_BASE = 'https://prod.wdckeystone.com';
const CONFIG_URL = 'https://config.mycloud.com/config/v1/config';

// Token cache
let tokenCache = {
  accessToken: null,
  refreshToken: null,
  idToken: null,
  expiresAt: 0,
};

// Device proxy cache
let proxyUrlCache = null;

/**
 * Check if remote mode is available (credentials configured)
 */
function isRemoteMode() {
  return !!(WD_CLOUD_EMAIL && WD_CLOUD_PASSWORD);
}

/**
 * Make an HTTP/HTTPS request
 */
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = client.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
          json: () => {
            try { return JSON.parse(body); } catch { return null; }
          },
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Make an HTTP request and return a stream (for file downloads)
 */
function httpRequestStream(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = client.request(reqOptions, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        stream: res,
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Stream request timeout')); });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Authenticate with WD Cloud and get access token
 */
async function authenticate() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache;
  }

  // Try refresh token first
  if (tokenCache.refreshToken) {
    try {
      return await refreshAccessToken();
    } catch (e) {
      console.log('Token refresh failed, doing full auth...');
    }
  }

  console.log('Authenticating with WD Cloud...');

  const body = JSON.stringify({
    grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
    realm: 'Username-Password-Authentication',
    audience: 'mycloud.com',
    username: WD_CLOUD_EMAIL,
    password: WD_CLOUD_PASSWORD,
    scope: 'openid offline_access nas_read_write nas_read_only user_read device_read',
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
  });

  const res = await httpRequest(`${AUTH0_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  if (res.status !== 200) {
    throw new Error(`WD Cloud auth failed (${res.status}): ${res.body}`);
  }

  const data = res.json();
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  console.log('WD Cloud authentication successful');
  return tokenCache;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
  const body = JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: tokenCache.refreshToken,
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    audience: 'mycloud.com',
  });

  const res = await httpRequest(`${AUTH0_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  if (res.status !== 200) {
    throw new Error(`Token refresh failed (${res.status})`);
  }

  const data = res.json();
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokenCache.refreshToken,
    idToken: data.id_token || tokenCache.idToken,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return tokenCache;
}

/**
 * Decode JWT payload (without verification - for internal use only)
 */
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch {
    return null;
  }
}

/**
 * Get device proxy URL (cached)
 */
async function getProxyUrl() {
  if (proxyUrlCache) return proxyUrlCache;

  const tokens = await authenticate();
  const payload = decodeJwt(tokens.accessToken) || decodeJwt(tokens.idToken);
  
  if (!payload || !payload.sub) {
    throw new Error('Could not extract user ID from token');
  }

  const res = await httpRequest(`${AUTH0_BASE}/device/v1/user/${payload.sub}`, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });

  if (res.status !== 200) {
    throw new Error(`Device discovery failed (${res.status}): ${res.body}`);
  }

  const data = res.json();
  if (!data.data || data.data.length === 0) {
    throw new Error('No devices found for this account');
  }

  proxyUrlCache = data.data[0].network.proxyURL;
  console.log('WD Cloud proxy URL discovered');
  return proxyUrlCache;
}

/**
 * List files in a folder
 * @param {string} parentId - Folder ID (use 'root' for root)
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of file objects
 */
async function listFiles(parentId = 'root', options = {}) {
  const proxyUrl = await getProxyUrl();
  const tokens = await authenticate();

  const params = new URLSearchParams({
    ids: parentId,
    fields: 'id,eTag,parentID,childCount,mimeType,name,size,mTime,cTime',
    pretty: 'false',
    orderBy: options.orderBy || 'name',
    order: options.order || 'asc',
    limit: String(options.limit || 500),
  });

  if (options.pageToken) {
    params.set('pageToken', options.pageToken);
  }

  const res = await httpRequest(`${proxyUrl}/sdk/v2/filesSearch/parents?${params}`, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });

  if (res.status !== 200) {
    throw new Error(`List files failed (${res.status}): ${res.body}`);
  }

  const data = res.json();
  return data.files || [];
}

/**
 * Recursively list all files in a folder tree
 */
async function listFilesRecursive(parentId = 'root', pathPrefix = '') {
  const items = await listFiles(parentId);
  const results = [];

  for (const item of items) {
    const itemPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;
    
    if (item.mimeType === 'application/x.wd.dir') {
      // It's a folder - recurse
      const children = await listFilesRecursive(item.id, itemPath);
      results.push(...children);
    } else {
      // It's a file
      results.push({
        ...item,
        relativePath: itemPath,
      });
    }
  }

  return results;
}

/**
 * Get file metadata by ID
 */
async function getFileById(fileId) {
  const proxyUrl = await getProxyUrl();
  const tokens = await authenticate();

  const res = await httpRequest(`${proxyUrl}/sdk/v2/files/${fileId}?fields=id,name,size,mimeType,mTime,cTime,parentID`, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });

  if (res.status !== 200) {
    throw new Error(`Get file failed (${res.status}): ${res.body}`);
  }

  return res.json();
}

/**
 * Search for files by name
 */
async function searchFiles(query, parentId = null) {
  const proxyUrl = await getProxyUrl();
  const tokens = await authenticate();

  const params = new URLSearchParams({
    query,
    limit: '100',
  });

  if (parentId) {
    params.set('fileId', parentId);
  }

  const res = await httpRequest(`${proxyUrl}/sdk/v2/filesSearch?${params}`, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });

  if (res.status !== 200) {
    throw new Error(`Search failed (${res.status}): ${res.body}`);
  }

  const data = res.json();
  return data.files || [];
}

/**
 * Stream a file's content (supports Range requests)
 * Returns { status, headers, stream } for piping to response
 */
async function streamFile(fileId, rangeHeader = null) {
  const proxyUrl = await getProxyUrl();
  const tokens = await authenticate();

  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
  };

  if (rangeHeader) {
    headers['Range'] = rangeHeader;
  }

  const res = await httpRequestStream(`${proxyUrl}/sdk/v3/files/${fileId}/content`, {
    headers,
  });

  return {
    status: rangeHeader ? 206 : 200,
    headers: res.headers,
    stream: res.stream,
  };
}

/**
 * Find a movie file by its relative path on the NAS
 * Tries multiple path variations to match the file
 */
async function findMovieFile(filePath) {
  // filePath is like "Action/Some Movie (2024) [1080p].mkv"
  // We need to navigate the folder structure to find it
  
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  
  // Start from root and navigate down
  let currentParentId = 'root';
  let foundFolder = null;

  // Try to navigate through each path segment
  for (let i = 0; i < parts.length - 1; i++) {
    const folderName = parts[i];
    const items = await listFiles(currentParentId);
    
    const folder = items.find(item => 
      item.mimeType === 'application/x.wd.dir' && 
      item.name.toLowerCase() === folderName.toLowerCase()
    );

    if (!folder) {
      // Try partial match
      const partialMatch = items.find(item => 
        item.mimeType === 'application/x.wd.dir' && 
        item.name.toLowerCase().includes(folderName.toLowerCase())
      );
      
      if (partialMatch) {
        foundFolder = partialMatch;
        currentParentId = partialMatch.id;
      } else {
        break;
      }
    } else {
      foundFolder = folder;
      currentParentId = folder.id;
    }
  }

  if (!foundFolder) {
    // Fallback: search by filename
    const searchResults = await searchFiles(fileName);
    if (searchResults.length > 0) {
      return searchResults[0];
    }
    return null;
  }

  // List files in the final folder
  const files = await listFiles(currentParentId);
  
  // Find exact match
  let match = files.find(f => 
    f.mimeType !== 'application/x.wd.dir' && 
    f.name.toLowerCase() === fileName.toLowerCase()
  );

  // Try partial match
  if (!match) {
    match = files.find(f => 
      f.mimeType !== 'application/x.wd.dir' && 
      f.name.toLowerCase().includes(fileName.toLowerCase().split('.')[0])
    );
  }

  // Try very loose match
  if (!match) {
    const baseName = fileName.split('.')[0].toLowerCase();
    match = files.find(f => 
      f.mimeType !== 'application/x.wd.dir' && 
      f.name.toLowerCase().includes(baseName.substring(0, Math.min(20, baseName.length)))
    );
  }

  return match || null;
}

/**
 * Get folder ID by path (e.g., "Movies 2026/Action")
 */
async function getFolderIdByPath(folderPath) {
  const parts = folderPath.split('/').filter(Boolean);
  let currentParentId = 'root';

  for (const part of parts) {
    const items = await listFiles(currentParentId);
    const folder = items.find(item => 
      item.mimeType === 'application/x.wd.dir' && 
      item.name.toLowerCase() === part.toLowerCase()
    );

    if (!folder) return null;
    currentParentId = folder.id;
  }

  return currentParentId;
}

module.exports = {
  isRemoteMode,
  authenticate,
  getProxyUrl,
  listFiles,
  listFilesRecursive,
  getFileById,
  searchFiles,
  streamFile,
  findMovieFile,
  getFolderIdByPath,
  decodeJwt,
};
