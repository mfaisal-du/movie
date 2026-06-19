const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/v1/movies - List all movies (paginated, filterable, sortable)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      sort = 'added_at',
      order = 'desc',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = 'SELECT * FROM v_movie_genres WHERE is_active = 1';
    const params = [];

    if (genre) {
      query += ' AND FIND_IN_SET(?, genre_slugs) > 0';
      params.push(genre);
    }

    // Count total
    const [countResult] = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );
    const total = countResult[0].total;

    // Sort
    const validSorts = ['title', 'year', 'rating', 'added_at', 'view_count'];
    const sortField = validSorts.includes(sort) ? sort : 'added_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [movies] = await pool.query(query, params);

    // Parse JSON fields and map snake_case to camelCase
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

    res.json({
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
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET /api/v1/movies/featured - Get featured movies for hero banner
router.get('/featured', async (req, res) => {
  try {
    const [movies] = await pool.query(
      `SELECT m.id, m.title, m.year, m.duration, m.synopsis, m.rating, 
              m.poster_url, m.backdrop_url, m.trailer_url, m.quality, m.view_count
       FROM movies m
       WHERE m.is_active = 1 AND m.featured = 1
       ORDER BY RAND()
       LIMIT 5`
    );

    // Get genres for each movie
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

    res.json({ success: true, data: { movies: moviesWithGenres } });
  } catch (error) {
    console.error('Error fetching featured movies:', error);
    res.status(500).json({ error: 'Failed to fetch featured movies' });
  }
});

// GET /api/v1/movies/genre/:slug - Get movies by genre
router.get('/genre/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, sort = 'added_at', order = 'desc' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [movies] = await pool.query(
      `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names, GROUP_CONCAT(DISTINCT g.slug) as genre_slugs
       FROM movies m
       JOIN movie_genres mg ON m.id = mg.movie_id
       JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1 AND g.slug = ?
       GROUP BY m.id
       ORDER BY ${sort === 'title' ? 'm.title' : `m.${sort}`} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT ? OFFSET ?`,
      [slug, parseInt(limit), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT m.id) as total
       FROM movies m
       JOIN movie_genres mg ON m.id = mg.movie_id
       JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1 AND g.slug = ?`,
      [slug]
    );

    // Map snake_case to camelCase
    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
      genreSlugs: movie.genre_slugs ? movie.genre_slugs.split(',') : [],
    }));

    res.json({
      success: true,
      data: {
        movies: parsedMovies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET /api/v1/movies/search - Search movies with filters
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, year, rating, minRating, page = 1, sortBy = 'rating', sortOrder = 'desc' } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ success: true, data: { movies: [] } });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${q}%`;
    const minRatingValue = minRating ? parseFloat(minRating) : 0;

    let query = `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names
                 FROM movies m
                 LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                 LEFT JOIN genres g ON mg.genre_id = g.id
                 WHERE m.is_active = 1
                   AND (m.title LIKE ? OR m.original_title LIKE ? OR g.name LIKE ?)`;
    const params = [searchTerm, searchTerm, searchTerm];

    // Year filter
    if (year) {
      query += ' AND m.year = ?';
      params.push(parseInt(year));
    }

    // Rating filter
    if (rating) {
      query += ' AND m.rating >= ?';
      params.push(parseFloat(rating));
    } else if (minRating) {
      query += ` AND m.rating >= ?`;
      params.push(minRatingValue);
    }

    query += ` GROUP BY m.id
                 ORDER BY m.${['rating', 'year', 'added_at'].includes(sortBy) ? sortBy : 'rating'} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
                 LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [movies] = await pool.query(query, params);

    // Get total count - build separate query without LIMIT/OFFSET
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

    res.json({
      success: true,
      data: {
        movies: parsedMovies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0]?.total || 0,
          totalPages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// GET /api/v1/movies/recent - Recently added movies
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const [movies] = await pool.query(
      `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1
       GROUP BY m.id
       ORDER BY m.added_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
    }));

    res.json({ success: true, data: { movies: parsedMovies } });
  } catch (error) {
    console.error('Error fetching recent movies:', error);
    res.status(500).json({ error: 'Failed to fetch recent movies' });
  }
});

// GET /api/v1/movies/popular - Most viewed movies
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const [movies] = await pool.query(
      `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       WHERE m.is_active = 1
       GROUP BY m.id
       ORDER BY m.view_count DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
    }));

    res.json({ success: true, data: { movies: parsedMovies } });
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

// GET /api/v1/movies/:id - Get single movie
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [movies] = await pool.query(
      `SELECT m.*, GROUP_CONCAT(DISTINCT g.name) as genre_names, GROUP_CONCAT(DISTINCT g.slug) as genre_slugs
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       WHERE m.id = ?
       GROUP BY m.id`,
      [id]
    );

    if (movies.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = {
      ...movies[0],
      posterUrl: movies[0].poster_url,
      backdropUrl: movies[0].backdrop_url,
      trailerUrl: movies[0].trailer_url,
      audioInfo: movies[0].audio_info,
      hasSubtitles: movies[0].has_subtitles === 1,
      viewCount: movies[0].view_count,
      addedAt: movies[0].added_at,
      updatedAt: movies[0].updated_at,
      genres: movies[0].genre_names ? movies[0].genre_names.split(',') : [],
      genreSlugs: movies[0].genre_slugs ? movies[0].genre_slugs.split(',') : [],
      cast: movies[0].cast ? JSON.parse(movies[0].cast) : null,
    };

    res.json({ success: true, data: movie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// GET /api/v1/movies/:id/similar - Get similar movies
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 12 } = req.query;

    const [movies] = await pool.query(
      `SELECT DISTINCT m2.*, GROUP_CONCAT(DISTINCT g2.name) as genre_names
       FROM movies m2
       JOIN movie_genres mg2 ON m2.id = mg2.movie_id
       JOIN movie_genres mg1 ON mg1.genre_id = mg2.genre_id
       JOIN movies m1 ON mg1.movie_id = m1.id
       LEFT JOIN movie_genres mg ON m2.id = mg.movie_id
       LEFT JOIN genres g2 ON mg.genre_id = g2.id
       WHERE m1.id = ? AND m2.id != ? AND m2.is_active = 1
       GROUP BY m2.id
       ORDER BY m2.rating DESC
       LIMIT ?`,
      [id, id, parseInt(limit)]
    );

    const parsedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.poster_url,
      backdropUrl: movie.backdrop_url,
      genres: movie.genre_names ? movie.genre_names.split(',') : [],
    }));

    res.json({ success: true, data: { movies: parsedMovies } });
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    res.status(500).json({ error: 'Failed to fetch similar movies' });
  }
});

module.exports = router;
