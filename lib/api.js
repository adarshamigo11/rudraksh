import { NextResponse } from 'next/server';

export const json = (data, status = 200) => NextResponse.json(data, { status });

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

export function handleError(e) {
  if (e?.status) return json({ error: e.message }, e.status);
  console.error(e);
  if (e?.code === 11000) {
    return json({ error: `Duplicate value — ${Object.keys(e.keyPattern || {}).join(', ') || 'entry'} already exists` }, 409);
  }
  if (e?.name === 'ValidationError') {
    return json({ error: Object.values(e.errors).map((x) => x.message).join(', ') }, 400);
  }
  if (e?.name === 'CastError') return json({ error: `Invalid value for ${e.path}` }, 400);
  if (/MongoServerSelection|MongooseServerSelection|ECONNREFUSED|MONGODB_URI/i.test(`${e?.name} ${e?.message}`)) {
    return json({ error: 'Database connection failed. Check MONGODB_URI and that your IP is allowed in MongoDB.' }, 503);
  }
  return json({ error: 'Something went wrong. Please try again.' }, 500);
}
