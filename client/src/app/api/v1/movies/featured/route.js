import { NextResponse } from 'next/server';
import pool from '../../../db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [movies] = await pool.query(
      `SELECT m.id, m.title, m.year, m.duration, m.synopsis, m.rating, 
              m.poster_url, m.backdrop_url, m.trailer_url, m.quality, m.view_count
       FROM movies m
       WHERE m.is_active = 1 AND m.featured = 1
       ORDER BY RAND()
       LIMIT 5`
    );

    const moviesWithGenres = await Promise.all(movies.map(async (movie) => {
      const [genres] = await pool.query(
        `SELECT g.name, g.slug FROM genres g
         JOIN movie_genres mg ON g.id = mg.genre_id
         WHERE mg.movie_id = ?`,
        [movie.id]
      );
      return {
        ...movie,
        genres: genres.map(g => g.name),
        genreSlugs: genres.map(g => g.slug),
        posterUrl: movie.poster_url,
        backdropUrl: movie.backdrop_url,
      };
    }));

    return NextResponse.json({ success: true, data: { movies: moviesWithGenres } });
  } catch (error) {
    console.error('Error fetching featured movies:', error);
    return NextResponse.json({ error: 'Failed to fetch featured movies' }, { status: 500 });
  }
}
