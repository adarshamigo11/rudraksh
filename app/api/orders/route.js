import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Counter from '@/models/Counter';
import Coupon from '@/models/Coupon';
import { json, handleError, httpError } from '@/lib/api';
import { priceOrder, reserveStock, restoreStock } from '@/lib/pricing';
import { getSettings } from '@/lib/settings';
import { razorpayConfigured, createRazorpayOrder } from '@/lib/razorpay';
import { digits } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);

export async function POST(req) {
  try {
    await dbConnect();
    const b = await req.json();
    const c = b.customer || {};
    const a = b.address || {};

    const phone = digits(c.phone).slice(-10);
    const name = str(c.name, 80);
    const email = str(c.email, 120).toLowerCase();
    if (name.length < 2) throw httpError(400, 'Please enter your name');
    if (!/^[6-9]\d{9}$/.test(phone)) throw httpError(400, 'Please enter a valid 10-digit mobile number');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter a valid email address');
    if (str(a.line1).length < 5) throw httpError(400, 'Please enter your full address');
    if (!/^[1-9]\d{5}$/.test(str(a.pincode))) throw httpError(400, 'Please enter a valid 6-digit pincode');
    if (!str(a.city) || !str(a.state)) throw httpError(400, 'Please enter city and state');

    const settings = await getSettings();
    const method = b.paymentMethod === 'online' ? 'online' : 'cod';
    if (method === 'cod' && !settings.codEnabled) throw httpError(400, 'Cash on Delivery is not available right now');
    if (method === 'online' && !razorpayConfigured()) throw httpError(400, 'Online payment is not available right now');

    const q = await priceOrder({ items: b.items, couponCode: b.couponCode, paymentMethod: method });
    await reserveStock(q.lines);

    const counter = await Counter.findOneAndUpdate({ key: 'order' }, { $inc: { seq: 1 } }, { upsert: true, new: true });
    const orderNumber = `RK${1000 + counter.seq}`;

    let order;
    try {
      order = await Order.create({
        orderNumber,
        publicId: crypto.randomBytes(9).toString('hex'),
        items: q.lines,
        customer: { name, phone, email },
        address: {
          line1: str(a.line1, 200),
          line2: str(a.line2, 200),
          landmark: str(a.landmark, 100),
          city: str(a.city, 80),
          state: str(a.state, 80),
          pincode: str(a.pincode),
        },
        subtotal: q.subtotal,
        siddhTotal: q.siddhTotal,
        discount: q.discount,
        prepaidDiscount: q.prepaidDiscount,
        shipping: q.shipping,
        codFee: q.codFee,
        total: q.total,
        couponCode: q.couponCode,
        paymentMethod: method,
        customerNote: str(b.note, 300),
        history: [{ status: 'pending', note: 'Order placed' }],
      });
    } catch (e) {
      await restoreStock(q.lines);
      throw e;
    }

    if (q.coupon) await Coupon.updateOne({ _id: q.coupon._id }, { $inc: { used: 1 } });

    let razorpay = null;
    if (method === 'online') {
      try {
        razorpay = await createRazorpayOrder(order);
        order.razorpay = { orderId: razorpay.orderId };
        await order.save();
      } catch (e) {
        console.error('Razorpay order failed:', e.message);
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        order.restocked = true;
        order.history.push({ status: 'cancelled', note: 'Could not start online payment' });
        await order.save();
        await restoreStock(q.lines);
        throw httpError(502, 'Could not start online payment. Please try again or choose Cash on Delivery.');
      }
    }

    return json({ ok: true, publicId: order.publicId, orderNumber, razorpay }, 201);
  } catch (e) {
    return handleError(e);
  }
}
