import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moviecloud',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request, { params }) {
  const slug = params.slug || [];
  const path = slug.join('/');
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);

  try {
    // Health check
    if (path === 'health') {
      return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Movies list
    if (path === 'movies' && !searchParams.id) {
      return await handleMoviesList(searchParams);
    }

    // Featured movies
    if (path === 'movies/featured') {
      return await handleFeaturedMovies();
    }

    // Recent movies
    if (path === 'movies/recent') {
      return await handleRecentMovies(searchParams);
    }

    // Popular movies
    if (path === 'movies/popular') {
      return await handlePopularMovies(searchParams);
    }

    // Search
    if (path === 'movies/search') {
      return await handleSearch(searchParams);
    }

    // Single movie
    if (path.startsWith('movies/') && !path.includes('/')) {
      const id = path.replace('movies/', '');
      return await handleSingleMovie(id);
    }

    // Genres
    if (path === 'genres') {
      return await handleGenres();
    }

    // Movies by genre
    if (path.startsWith('genres/')) {
      const genre = path.replace('genres/', '');
      return await handleMoviesByGenre(genre, searchParams);
    }

    // Admin scan
    if (path === 'admin/scan') {
      return NextResponse.json({ message: 'Scan triggered' });
    }

    // System endpoints
    if (path === 'system/health') {
      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMoviesList(params) {
  const { page = 1, limit = 20, genre, sort = 'added_at', order = 'desc' } = params;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT * FROM v_movie_genres WHERE is_active = 1';
  const queryParams = [];

  if (genre) {
    query += ' AND FIND_IN_SET(?, genre_slugs) > 0';
    queryParams.push(genre);
  }

  const [countResult] = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'), queryParams);
  const total = countResult[0].total;

  const validSorts = ['title', 'year', 'rating', 'added_at', 'view_count'];
  const sortField = validSorts.includes(sort) ? sort : 'added_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), offset);

  const [movies] = await pool.query(query, queryParams);

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
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
}

async function handleFeaturedMovies() {
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
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      trailerUrl: movie.trailer_url,
      viewCount: movie.view_count,
      genres: genres.map(g => g.name),
    };
  }));

  return NextResponse.json({ success: true, data: { movies: moviesWithGenres } });
}

async function handleRecentMovies(params) {
  const limit = parseInt(params.limit || '20');
  const [movies] = await pool.query(
    `SELECT *, poster_url as posterUrl, backdrop_url as backdropUrl, 
            trailer_url as trailerUrl, view_count as viewCount
     FROM movies WHERE is_active = 1
     ORDER BY added_at DESC LIMIT ?`,
    [limit]
  );
  return NextResponse.json({ success: true, data: { movies } });
}

async function handlePopularMovies(params) {
  const limit = parseInt(params.limit || '20');
  const [movies] = await pool.query(
    `SELECT *, poster_url as posterUrl, backdrop_url as backdropUrl,
            trailer_url as trailerUrl, view_count as viewCount
     FROM movies WHERE is_active = 1
     ORDER BY view_count DESC LIMIT ?`,
    [limit]
  );
  return NextResponse.json({ success: true, data: { movies } });
}

async function handleSearch(params) {
  const { q = '', page = 1, limit = 20 } = params;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (!q) {
    return NextResponse.json({ success: true, data: { movies: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } });
  }

  const searchTerm = `%${q}%`;
  const [movies] = await pool.query(
    `SELECT DISTINCT m.*, 
            poster_url as posterUrl, backdrop_url as backdropUrl,
            trailer_url as trailerUrl, view_count as viewCount,
            GROUP_CONCAT(g.name) as genres, GROUP_CONCAT(g.slug) as genreSlugs
     FROM movies m
     LEFT JOIN movie_genres mg ON m.id = mg.movie_id
     LEFT JOIN genres g ON mg.genre_id = g.id
     WHERE m.is_active = 1 AND (m.title LIKE ? OR m.original_title LIKE ? OR g.name LIKE ?)
     GROUP BY m.id
     ORDER BY m.added_at DESC
     LIMIT ? OFFSET ?`,
    [searchTerm, searchTerm, searchTerm, parseInt(limit), offset]
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(DISTINCT m.id) as total
     FROM movies m
     LEFT JOIN movie_genres mg ON m.id = mg.movie_id
     LEFT JOIN genres g ON mg.genre_id = g.id
     WHERE m.is_active = 1 AND (m.title LIKE ? OR m.original_title LIKE ? OR g.name LIKE ?)`,
    [searchTerm, searchTerm, searchTerm]
  );

  const total = countResult[0].total;
  const parsedMovies = movies.map(movie => ({
    ...movie,
    genres: movie.genres ? movie.genres.split(',') : [],
    genreSlugs: movie.genreSlugs ? movie.genreSlugs.split(',') : [],
    cast: movie.cast ? JSON.parse(movie.cast) : null,
  }));

  return NextResponse.json({
    success: true,
    data: {
      movies: parsedMovies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
}

async function handleSingleMovie(id) {
  const [movies] = await pool.query('SELECT * FROM movies WHERE id = ? AND is_active = 1', [id]);

  if (movies.length === 0) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  const movie = movies[0];
  const [genres] = await pool.query(
    `SELECT g.name, g.slug FROM genres g
     JOIN movie_genres mg ON g.id = mg.genre_id
     WHERE mg.movie_id = ?`,
    [id]
  );

  const [similar] = await pool.query(
    `SELECT m.*, poster_url as posterUrl, backdrop_url as backdropUrl
     FROM movies m
     JOIN movie_genres mg ON m.id = mg.movie_id
     WHERE mg.genre_id IN (SELECT genre_id FROM movie_genres WHERE movie_id = ?)
     AND m.id != ? AND m.is_active = 1
     ORDER BY RAND() LIMIT 6`,
    [id, id]
  );

  return NextResponse.json({
    success: true,
    data: {
      movie: {
        ...movie,
        posterUrl: movie.poster_url,
        backdropUrl: movie.backdrop_url,
        trailerUrl: movie.trailer_url,
        audioInfo: movie.audio_info,
        hasSubtitles: movie.has_subtitles === 1,
        viewCount: movie.view_count,
        genres: genres.map(g => g.name),
        genreSlugs: genres.map(g => g.slug),
        cast: movie.cast ? JSON.parse(movie.cast) : null,
      },
      similar,
    },
  });
}

async function handleGenres() {
  const [genres] = await pool.query(
    `SELECT g.*, COUNT(DISTINCT mg.movie_id) as movie_count
     FROM genres g
     LEFT JOIN movie_genres mg ON g.id = mg.genre_id
     LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
     GROUP BY g.id
     ORDER BY movie_count DESC`
  );
  return NextResponse.json({ success: true, data: { genres } });
}

async function handleMoviesByGenre(genre, params) {
  const { page = 1, limit = 20, sort = 'added_at', order = 'desc' } = params;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const [movies] = await pool.query(
    `SELECT m.*, poster_url as posterUrl, backdrop_url as backdropUrl,
            trailer_url as trailerUrl, view_count as viewCount
     FROM movies m
     JOIN movie_genres mg ON m.id = mg.movie_id
     JOIN genres g ON mg.genre_id = g.id
     WHERE g.slug = ? AND m.is_active = 1
     ORDER BY m.${sort === 'view_count' ? 'view_count' : 'added_at'} ${order === 'asc' ? 'ASC' : 'DESC'}
     LIMIT ? OFFSET ?`,
    [genre, parseInt(limit), offset]
  );

  return NextResponse.json({ success: true, data: { movies } });
}
