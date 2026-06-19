import { NextResponse } from 'next/server';
import pool from '../../db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const sort = searchParams.get('sort') || 'added_at';
    const order = searchParams.get('order') || 'desc';

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM v_movie_genres WHERE is_active = 1';
    const params = [];

    if (genre) {
      query += ' AND FIND_IN_SET(?, genre_slugs) > 0';
      params.push(genre);
    }

    const [countResult] = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );
    const total = countResult[0].total;

    const validSorts = ['title', 'year', 'rating', 'added_at', 'view_count'];
    const sortField = validSorts.includes(sort) ? sort : 'added_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [movies] = await pool.query(query, params);

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      trailerUrl: movie.trailer_url,
      audioInfo: movie.audio_info,
      hasSubtitles: movie.has_subtitles === 1,
      viewCount: movie.view_count,
      addedAt: movie.added_at,
      updatedAt: movie.updated_at,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
      genreSlugs: movie.genre_slugs ? movie.genre_slugs.split(',') : [],
      cast: movie.cast ? JSON.parse(movie.cast) : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        movies: parsedMovies,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
