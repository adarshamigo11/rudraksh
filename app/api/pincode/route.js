import { json } from '@/lib/api';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const fmt = (days) =>
  new Date(Date.now() + days * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export async function GET(req) {
  const pin = new URL(req.url).searchParams.get('pin') || '';
  if (!/^[1-9]\d{5}$/.test(pin)) return json({ ok: false, error: 'Enter a valid 6-digit pincode' }, 400);

  let city = '';
  let state = '';
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: AbortSignal.timeout(4000) });
    const d = await r.json();
    const po = d?.[0]?.PostOffice?.[0];
    if (po) {
      city = po.District;
      state = po.State;
    } else if (d?.[0]?.Status === 'Error' || d?.[0]?.Status === '404') {
      return json({ ok: false, error: 'We could not find this pincode' }, 404);
    }
  } catch {
    // Lookup service is optional — delivery estimate still works without it
  }

  const s = await getSettings();
  return json({ ok: true, city, state, from: fmt(s.deliveryMinDays), to: fmt(s.deliveryMaxDays) });
}
