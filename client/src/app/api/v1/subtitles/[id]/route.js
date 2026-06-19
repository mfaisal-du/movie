import { NextResponse } from 'next/server';
import pool from '../../../db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [id]);

    if (movies.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const movie = movies[0];
    const file_name = movie.file_name || '';
    const baseName = file_name.replace(/\.[^.]+$/, '');

    return NextResponse.json({
      success: true,
      subtitles: [],
    });
  } catch (error) {
    console.error('Subtitle fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subtitles' }, { status: 500 });
  }
}
