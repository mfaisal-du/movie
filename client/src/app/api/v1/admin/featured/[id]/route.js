import { NextResponse } from 'next/server';
import pool from '../../../../db';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const password = request.headers.get('x-admin-password') || searchParams.get('password');
  return password === ADMIN_PASSWORD;
}

export async function POST(request, { params }) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = params;
    await pool.query('UPDATE movies SET featured = NOT featured, updated_at = NOW() WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Featured status toggled' });
  } catch (error) {
    console.error('Error toggling featured:', error);
    return NextResponse.json({ error: 'Failed to toggle featured' }, { status: 500 });
  }
}
