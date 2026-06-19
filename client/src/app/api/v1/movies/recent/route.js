import { NextResponse } from 'next/server';
import pool from '../../../db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const [movies] = await pool.query(
      `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1
       GROUP BY m.id
       ORDER BY m.added_at DESC
       LIMIT ?`,
      [limit]
    );

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
    }));

    return NextResponse.json({ success: true, data: { movies: parsedMovies } });
  } catch (error) {
    console.error('Error fetching recent movies:', error);
    return NextResponse.json({ error: 'Failed to fetch recent movies' }, { status: 500 });
  }
}
