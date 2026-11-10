import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { json, handleError, httpError } from '@/lib/api';
import { digits } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await dbConnect();
    const b = await req.json();
    if (b.website) return json({ ok: true }); // honeypot
    const email = String(b.email || '').trim().toLowerCase().slice(0, 120);

    if (b.type === 'newsletter') {
      if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter a valid email');
      await Lead.updateOne({ type: 'newsletter', email }, { $setOnInsert: { type: 'newsletter', email } }, { upsert: true });
      return json({ ok: true });
    }

    const name = String(b.name || '').trim().slice(0, 80);
    const message = String(b.message || '').trim().slice(0, 2000);
    const phone = digits(b.phone).slice(-10);
    if (name.length < 2) throw httpError(400, 'Please enter your name');
    if (message.length < 5) throw httpError(400, 'Please write your message');
    if (!email && !phone) throw httpError(400, 'Please give an email or phone number so we can reply');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter a valid email');
    await Lead.create({ type: 'contact', name, email, phone, message });
    return json({ ok: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}
