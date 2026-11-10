import { json, handleError } from '@/lib/api';
import { priceOrder } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const b = await req.json();
    const q = await priceOrder({ items: b.items, couponCode: b.couponCode, paymentMethod: b.paymentMethod });
    const { lines, coupon, ...rest } = q;
    return json(rest);
  } catch (e) {
    return handleError(e);
  }
}
