import { NextResponse } from 'next/server';
import pool from '../../../db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [movies] = await pool.query('SELECT poster_url, title FROM movies WHERE id = ?', [id]);

    if (movies.length === 0) {
      return NextResponse.redirect(`https://placehold.co/500x750/1a1a1a/ffffff?text=${encodeURIComponent(id)}`);
    }

    const movie = movies[0];
    if (!movie.poster_url) {
      return NextResponse.redirect(`https://source.unsplash.com/500x750/?movie,${encodeURIComponent(movie.title || id)}`);
    }

    return NextResponse.redirect(movie.poster_url);
  } catch {
    return NextResponse.redirect(`https://placehold.co/500x750/1a1a1a/ffffff?text=error`);
  }
}
