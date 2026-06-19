import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subtitlePath = searchParams.get('path');

    if (!subtitlePath || typeof subtitlePath !== 'string') {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const fs = require('fs');
    const path = require('path');
    const normalizedPath = path.normalize(decodeURIComponent(subtitlePath));

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'Subtitle not found' }, { status: 404 });
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentTypes = { '.srt': 'text/plain', '.vtt': 'text/vtt', '.ass': 'text/plain', '.ssa': 'text/plain' };
    const content = fs.readFileSync(normalizedPath, 'utf8');

    let output = content;
    if (ext === '.srt') {
      output = 'WEBVTT\n\n' + content.replace(/\d+\r?\n(\d{2}:\d{2}:\d{2}),\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/g, (match) => match.replace(/,/g, '.'));
    }

    return new Response(output, {
      headers: { 'Content-Type': contentTypes[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Subtitle file error:', error);
    return NextResponse.json({ error: 'Failed to read subtitle file' }, { status: 500 });
  }
}
