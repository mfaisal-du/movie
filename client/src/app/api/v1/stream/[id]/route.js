import { NextResponse } from 'next/server';
import pool from '../../../db';

export const dynamic = 'force-dynamic';

const WD_CLOUD_EMAIL = process.env.WD_CLOUD_EMAIL;
const WD_CLOUD_PASSWORD = process.env.WD_CLOUD_PASSWORD;
const AUTH0_CLIENT_ID = '9B0Gi617tROKHc2rS95sT1yJzR6MkQDm';
const AUTH0_CLIENT_SECRET = 'oSJOB1KOWnLVZm11DVknu2wZkTj5AGKxcINEDtEUPE30jHKvEqorM8ocWbyo17Hd';
const AUTH0_BASE = 'https://prod.wdckeystone.com';

let tokenCache = { accessToken: null, refreshToken: null, expiresAt: 0 };
let proxyUrlCache = null;

function getMimeType(ext) {
  const map = { '.mkv': 'video/x-matroska', '.mp4': 'video/mp4', '.avi': 'video/x-msvideo', '.wmv': 'video/x-ms-wmv', '.mov': 'video/quicktime', '.webm': 'video/webm' };
  return map[ext] || 'video/mp4';
}

async function wdAuth() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60000) return tokenCache;
  if (tokenCache.refreshToken) {
    try {
      const res = await fetch(`${AUTH0_BASE}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token', refresh_token: tokenCache.refreshToken,
          client_id: AUTH0_CLIENT_ID, client_secret: AUTH0_CLIENT_SECRET, audience: 'mycloud.com',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        tokenCache = { accessToken: data.access_token, refreshToken: data.refresh_token || tokenCache.refreshToken, expiresAt: Date.now() + (data.expires_in * 1000) };
        return tokenCache;
      }
    } catch {}
  }
  const res = await fetch(`${AUTH0_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm', realm: 'Username-Password-Authentication',
      audience: 'mycloud.com', username: WD_CLOUD_EMAIL, password: WD_CLOUD_PASSWORD,
      scope: 'openid offline_access nas_read_write nas_read_only user_read device_read',
      client_id: AUTH0_CLIENT_ID, client_secret: AUTH0_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('WD auth failed');
  const data = await res.json();
  tokenCache = { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + (data.expires_in * 1000) };
  return tokenCache;
}

async function getProxyUrl() {
  if (proxyUrlCache) return proxyUrlCache;
  const tokens = await wdAuth();
  const payload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64').toString());
  const res = await fetch(`${AUTH0_BASE}/device/v1/user/${payload.sub}`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error('Device discovery failed');
  const data = await res.json();
  proxyUrlCache = data.data[0].network.proxyURL;
  return proxyUrlCache;
}

async function wdListFiles(parentId) {
  const proxyUrl = await getProxyUrl();
  const tokens = await wdAuth();
  const res = await fetch(`${proxyUrl}/sdk/v2/filesSearch/parents?ids=${parentId}&limit=500&fields=id,name,mimeType,size`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.files || [];
}

async function wdFindMovieFile(filePath) {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  let currentParentId = 'root';

  for (let i = 0; i < parts.length - 1; i++) {
    const items = await wdListFiles(currentParentId);
    const folder = items.find(item => item.mimeType === 'application/x.wd.dir' && item.name.toLowerCase() === parts[i].toLowerCase());
    if (!folder) {
      const partial = items.find(item => item.mimeType === 'application/x.wd.dir' && item.name.toLowerCase().includes(parts[i].toLowerCase()));
      if (partial) { currentParentId = partial.id; } else { break; }
    } else {
      currentParentId = folder.id;
    }
  }

  const files = await wdListFiles(currentParentId);
  let match = files.find(f => f.mimeType !== 'application/x.wd.dir' && f.name.toLowerCase() === fileName.toLowerCase());
  if (!match) {
    const baseName = fileName.split('.')[0].toLowerCase();
    match = files.find(f => f.mimeType !== 'application/x.wd.dir' && f.name.toLowerCase().includes(baseName.substring(0, 20)));
  }
  return match || null;
}

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ? AND is_active = 1', [id]);
    if (movies.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const movie = movies[0];

    if (!WD_CLOUD_EMAIL || !WD_CLOUD_PASSWORD) {
      return NextResponse.json({ error: 'No storage configured' }, { status: 503 });
    }

    const file = await wdFindMovieFile(movie.file_path);
    if (!file) {
      return NextResponse.json({ error: 'Movie file not available' }, { status: 503 });
    }

    const proxyUrl = await getProxyUrl();
    const tokens = await wdAuth();
    const range = request.headers.get('range');

    const headers = { Authorization: `Bearer ${tokens.accessToken}` };
    if (range) headers.Range = range;

    const apiRes = await fetch(`${proxyUrl}/sdk/v3/files/${file.id}/content`, { headers });

    const ext = movie.file_name ? '.' + movie.file_name.split('.').pop() : '.mp4';
    const responseHeaders = {
      'Content-Type': getMimeType(ext),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    };

    if (apiRes.headers.get('content-length')) responseHeaders['Content-Length'] = apiRes.headers.get('content-length');
    if (apiRes.headers.get('content-range')) responseHeaders['Content-Range'] = apiRes.headers.get('content-range');

    pool.query('UPDATE movies SET view_count = view_count + 1 WHERE id = ?', [id]).catch(() => {});

    return new Response(apiRes.body, { status: range ? 206 : 200, headers: responseHeaders });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Stream failed' }, { status: 500 });
  }
}

export async function HEAD(request, { params }) {
  const { id } = params;
  try {
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ? AND is_active = 1', [id]);
    if (movies.length === 0) return new NextResponse(null, { status: 404 });

    const movie = movies[0];
    if (!WD_CLOUD_EMAIL || !WD_CLOUD_PASSWORD) return new NextResponse(null, { status: 503 });

    const file = await wdFindMovieFile(movie.file_path);
    if (!file) return new NextResponse(null, { status: 503 });

    const ext = movie.file_name ? '.' + movie.file_name.split('.').pop() : '.mp4';
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': getMimeType(ext),
        'Accept-Ranges': 'bytes',
        'Content-Length': String(file.size || 0),
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
