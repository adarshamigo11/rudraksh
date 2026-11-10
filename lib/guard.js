import { cookies } from 'next/headers';
import { verifyAdmin, COOKIE } from './auth';
import { httpError } from './api';

export async function isAdmin() {
  const t = cookies().get(COOKIE)?.value;
  return !!(t && (await verifyAdmin(t)));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw httpError(401, 'Unauthorized');
}
