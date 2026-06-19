import { NextResponse } from 'next/server';
import pool from '../../../db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const year = searchParams.get('year');
    const rating = searchParams.get('rating');
    const minRating = searchParams.get('minRating');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ success: true, data: { movies: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;
    const minRatingValue = minRating ? parseFloat(minRating) : 0;

    let query = `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names
                 FROM movies m
                 LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                 LEFT JOIN genres g ON mg.genre_id = g.id
                 WHERE m.is_active = 1
                   AND (m.title LIKE ? OR m.original_title LIKE ? OR g.name LIKE ?)`;
    const params = [searchTerm, searchTerm, searchTerm];

    if (year) { query += ' AND m.year = ?'; params.push(parseInt(year)); }
    if (rating) { query += ' AND m.rating >= ?'; params.push(parseFloat(rating)); }
    else if (minRating) { query += ' AND m.rating >= ?'; params.push(minRatingValue); }

    const validSorts = ['rating', 'year', 'added_at'];
    const sortField = validSorts.includes(sortBy) ? sortBy : 'rating';
    query += ` GROUP BY m.id ORDER BY m.${sortField} ${sortOrder === 'asc' ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [movies] = await pool.query(query, params);

    let countQuery = `SELECT COUNT(DISTINCT m.id) as total
                      FROM movies m
                      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                      LEFT JOIN genres g ON mg.genre_id = g.id
                      WHERE m.is_active = 1
                        AND (m.title LIKE ? OR m.original_title LIKE ? OR g.name LIKE ?)`;
    const countParams = [searchTerm, searchTerm, searchTerm];
    if (year) countParams.push(parseInt(year));
    if (rating) countParams.push(parseFloat(rating));
    else if (minRating) countParams.push(minRatingValue);

    const [countResult] = await pool.query(countQuery, countParams);

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        movies: parsedMovies,
        pagination: {
          page, limit,
          total: countResult[0]?.total || 0,
          totalPages: Math.ceil((countResult[0]?.total || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
  }
}
