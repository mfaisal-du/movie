import { NextResponse } from 'next/server';
import pool from '../../../db';

export async function GET() {
  try {
    const [genres] = await pool.query(
      `SELECT g.*, COUNT(DISTINCT mg.movie_id) as movie_count
       FROM genres g
       LEFT JOIN movie_genres mg ON g.id = mg.genre_id
       LEFT JOIN movies m ON mg.movie_id = m.id AND m.is_active = 1
       GROUP BY g.id
       ORDER BY movie_count DESC`
    );

    return NextResponse.json({ success: true, data: { genres } });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
