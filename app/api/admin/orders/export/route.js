import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/guard';
import { handleError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5000).lean();
    const head = ['Order', 'Date', 'Status', 'Payment', 'Payment status', 'Name', 'Phone', 'Email', 'Address', 'City', 'State', 'Pincode', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Coupon', 'Tracking'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      o.status,
      o.paymentMethod,
      o.paymentStatus,
      o.customer?.name,
      o.customer?.phone,
      o.customer?.email,
      [o.address?.line1, o.address?.line2, o.address?.landmark].filter(Boolean).join(', '),
      o.address?.city,
      o.address?.state,
      o.address?.pincode,
      o.items.map((i) => `${i.name}${i.variantName ? ' (' + i.variantName + ')' : ''} x${i.qty}`).join('; '),
      o.subtotal,
      (o.discount || 0) + (o.prepaidDiscount || 0),
      o.shipping,
      o.total,
      o.couponCode,
      [o.tracking?.courier, o.tracking?.number].filter(Boolean).join(' '),
    ]);
    const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
