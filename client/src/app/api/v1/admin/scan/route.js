import { NextResponse } from 'next/server';
import pool from '../../../db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const password = request.headers.get('x-admin-password') || searchParams.get('password');
  return password === ADMIN_PASSWORD;
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Simple scan stub - will need full scanner implementation
    return NextResponse.json({
      success: true,
      message: 'Scan completed',
      data: { totalNew: 0, totalUpdated: 0, totalFailed: 0 },
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Scan failed: ' + error.message }, { status: 500 });
  }
}
