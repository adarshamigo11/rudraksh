import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/guard';
import { json, handleError, httpError } from '@/lib/api';
import { restoreStock } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await dbConnect();
    const b = await req.json();
    const order = await Order.findById(params.id);
    if (!order) throw httpError(404, 'Order not found');

    if (b.status && b.status !== order.status) {
      if (!Order.STATUSES.includes(b.status)) throw httpError(400, 'Invalid status');
      order.history.push({ status: b.status, note: b.note || '' });
      order.status = b.status;
      // Cancelled / returned orders put their stock back (once)
      if (['cancelled', 'returned'].includes(b.status) && !order.restocked) {
        await restoreStock(order.items.map((i) => ({ product: i.product, variantId: i.variantId, qty: i.qty, name: i.name })));
        order.restocked = true;
      }
      // Delivered COD orders are paid
      if (b.status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
        order.paymentStatus = 'paid';
      }
    }
    if (b.paymentStatus && ['pending', 'paid', 'failed', 'refunded'].includes(b.paymentStatus)) {
      order.paymentStatus = b.paymentStatus;
    }
    if (b.tracking) {
      order.tracking = {
        courier: String(b.tracking.courier || '').trim(),
        number: String(b.tracking.number || '').trim(),
        url: String(b.tracking.url || '').trim(),
      };
    }
    if (typeof b.adminNote === 'string') order.adminNote = b.adminNote;
    await order.save();
    return json(order);
  } catch (e) {
    return handleError(e);
  }
}
