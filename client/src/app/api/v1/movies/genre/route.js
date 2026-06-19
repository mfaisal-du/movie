import { NextResponse } from 'next/server';
import pool from '../../../db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'added_at';
    const order = searchParams.get('order') || 'desc';

    if (!slug) {
      return NextResponse.json({ error: 'Genre slug required' }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    const sortMap = { title: 'm.title' };
    const sortCol = sortMap[sort] || `m.${sort}`;
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const [movies] = await pool.query(
      `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names, GROUP_CONCAT(DISTINCT g.slug) as genre_slugs
       FROM movies m
       JOIN movie_genres mg ON m.id = mg.movie_id
       JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1 AND g.slug = ?
       GROUP BY m.id
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [slug, limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT m.id) as total
       FROM movies m
       JOIN movie_genres mg ON m.id = mg.movie_id
       JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1 AND g.slug = ?`,
      [slug]
    );

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
      genreSlugs: movie.genre_slugs ? movie.genre_slugs.split(',') : [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        movies: parsedMovies,
        pagination: {
          page, limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
