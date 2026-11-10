import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { signAdmin, COOKIE } from '@/lib/auth';
import { handleError, httpError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const safeEqual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw httpError(500, 'ADMIN_EMAIL / ADMIN_PASSWORD are not set on the server');
    }
    const ok =
      safeEqual(String(email || '').trim().toLowerCase(), process.env.ADMIN_EMAIL.trim().toLowerCase()) &
      safeEqual(password || '', process.env.ADMIN_PASSWORD);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      throw httpError(401, 'Invalid email or password');
    }
    const token = await signAdmin(process.env.ADMIN_EMAIL);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return handleError(e);
  }
}
