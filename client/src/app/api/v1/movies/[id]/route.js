import { NextResponse } from 'next/server';
import pool from '../../../db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;

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
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
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

    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}
