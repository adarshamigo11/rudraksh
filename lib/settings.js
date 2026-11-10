import dbConnect from './mongodb';
import Setting from '@/models/Setting';

export const DEFAULTS = {
  storeName: 'Rudraksha Store',
  tagline: 'Authentic Rudraksha, handcrafted in India',
  aboutText:
    'We bring you Rudraksha bracelets, malas and beads made with care.\n\nEdit this text from Admin → Settings.',
  announcements: ['🕉️ Free delivery on orders above ₹499', '🙏 Har Har Mahadev — genuine Rudraksha', '✨ Cash on Delivery available'],
  heroTitle: 'Wear the blessings of Mahadev',
  heroSubtitle: 'Genuine Rudraksha bracelets, malas and beads — handcrafted in India and delivered to your door.',
  heroCta: 'Shop Rudraksha',
  heroImage: '',
  freeShippingMin: 499,
  shippingFee: 49,
  codEnabled: true,
  codFee: 30,
  prepaidDiscount: 0,
  siddhPrice: 100,
  deliveryMinDays: 4,
  deliveryMaxDays: 7,
  returnDays: 7,
  replacementMonths: 0,
  whatsapp: '',
  phone: '',
  email: '',
  address: '',
  instagram: '',
  facebook: '',
  youtube: '',
};

// Always resolves — falls back to defaults if the database is unreachable.
export async function getSettings() {
  try {
    await dbConnect();
    const doc = await Setting.findOne({ key: 'store' }).lean();
    return { ...DEFAULTS, ...(doc?.data || {}) };
  } catch (e) {
    console.error('getSettings failed:', e.message);
    return { ...DEFAULTS };
  }
}

export function sanitizeSettings(input = {}) {
  const out = {};
  for (const [k, d] of Object.entries(DEFAULTS)) {
    if (!(k in input)) continue;
    const v = input[k];
    if (typeof d === 'number') out[k] = Math.max(0, Number(v) || 0);
    else if (typeof d === 'boolean') out[k] = !!v;
    else if (Array.isArray(d))
      out[k] = (Array.isArray(v) ? v : String(v ?? '').split('\n')).map((s) => String(s).trim()).filter(Boolean);
    else out[k] = String(v ?? '').trim();
  }
  return out;
}
