import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { json, handleError, httpError } from '@/lib/api';
import { razorpayConfigured, verifySignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    if (!razorpayConfigured()) throw httpError(400, 'Online payment is not enabled');
    await dbConnect();
    const b = await req.json();
    const order = await Order.findOne({ publicId: String(b.publicId || ''), 'razorpay.orderId': String(b.razorpay_order_id || '') });
    if (!order) throw httpError(404, 'Order not found');
    if (!verifySignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
      order.paymentStatus = 'failed';
      await order.save();
      throw httpError(400, 'Payment verification failed');
    }
    order.paymentStatus = 'paid';
    order.razorpay.paymentId = b.razorpay_payment_id;
    if (order.status === 'pending') {
      order.status = 'confirmed';
      order.history.push({ status: 'confirmed', note: 'Payment received' });
    }
    await order.save();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
