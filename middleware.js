import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login' || pathname === '/api/admin/login') return NextResponse.next();

  const token = req.cookies.get('admin_token')?.value;
  let ok = false;
  if (token && process.env.JWT_SECRET) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      ok = payload.role === 'admin';
    } catch {}
  }
  if (ok) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}
