import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'admin_token';

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set. Add it to .env.local');
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function signAdmin(email) {
  return new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyAdmin(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}
