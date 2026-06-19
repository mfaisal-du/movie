import { NextResponse } from 'next/server';
import pool from '../../../db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const password = request.headers.get('x-admin-password') || searchParams.get('password');
  return password === ADMIN_PASSWORD;
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [totalMovies] = await pool.query('SELECT COUNT(*) as total FROM movies WHERE is_active = 1');
    const [totalSize] = await pool.query('SELECT SUM(file_size) as total FROM movies WHERE is_active = 1');
    const [genreStats] = await pool.query(
      `SELECT g.name, g.slug, COUNT(DISTINCT mg.movie_id) as count
       FROM genres g
       LEFT JOIN movie_genres mg ON g.id = mg.genre_id
       LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
       GROUP BY g.id ORDER BY count DESC`
    );
    const [recentViews] = await pool.query(
      `SELECT COUNT(*) as count FROM view_logs WHERE started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalMovies: totalMovies[0].total,
        totalSize: totalSize[0].total || 0,
        genres: genreStats,
        recentViews: recentViews[0].count,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
