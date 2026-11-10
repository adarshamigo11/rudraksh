import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { json, handleError, httpError } from '@/lib/api';
import { digits } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await dbConnect();
    const b = await req.json();
    const orderNumber = String(b.orderNumber || '').trim().toUpperCase();
    const phone = digits(b.phone).slice(-10);
    if (!orderNumber || phone.length !== 10) throw httpError(400, 'Enter your order number and 10-digit mobile number');
    const o = await Order.findOne({ orderNumber, 'customer.phone': phone }).lean();
    if (!o) throw httpError(404, 'No order found with these details');
    return json({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: o.total,
      tracking: o.tracking,
      history: o.history,
      items: o.items.map((i) => ({ name: i.name, variantName: i.variantName, qty: i.qty, image: i.image })),
    });
  } catch (e) {
    return handleError(e);
  }
}
