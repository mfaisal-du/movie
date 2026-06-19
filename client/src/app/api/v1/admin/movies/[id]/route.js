import { NextResponse } from 'next/server';
import pool from '../../../../db';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const password = request.headers.get('x-admin-password') || searchParams.get('password');
  return password === ADMIN_PASSWORD;
}

export async function PUT(request, { params }) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = params;
    const { title, synopsis, rating, featured } = await request.json();

    await pool.query(
      `UPDATE movies SET 
        title = COALESCE(?, title),
        synopsis = COALESCE(?, synopsis),
        rating = COALESCE(?, rating),
        featured = COALESCE(?, featured),
        updated_at = NOW()
       WHERE id = ?`,
      [title, synopsis, rating, featured, id]
    );

    return NextResponse.json({ success: true, message: 'Movie updated' });
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = params;
    await pool.query('UPDATE movies SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Movie deactivated' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
