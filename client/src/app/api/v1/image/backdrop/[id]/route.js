import { NextResponse } from 'next/server';
import pool from '../../../db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [movies] = await pool.query('SELECT backdrop_url, title FROM movies WHERE id = ?', [id]);

    if (movies.length === 0) {
      return NextResponse.redirect(`https://placehold.co/1280x720/1a1a1a/ffffff?text=${encodeURIComponent(id)}`);
    }

    const movie = movies[0];
    if (!movie.backdrop_url) {
      return NextResponse.redirect(`https://placehold.co/1280x720/1a1a1a/ffffff?text=${encodeURIComponent(movie.title || id)}`);
    }

    return NextResponse.redirect(movie.backdrop_url);
  } catch {
    return NextResponse.redirect(`https://placehold.co/1280x720/1a1a1a/ffffff?text=error`);
  }
}
