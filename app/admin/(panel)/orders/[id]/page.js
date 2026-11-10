import Link from 'next/link';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActions from '@/components/admin/OrderActions';
import PrintButton from '@/components/admin/PrintButton';
import { Badge, PageHeader } from '@/components/admin/ui';
import { formatPrice, imgSrc, serialize, digits } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrderDetail({ params }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await dbConnect();
  const o = await Order.findById(params.id).lean();
  if (!o) notFound();
  const waText = encodeURIComponent(`Namaste ${o.customer.name}, regarding your order ${o.orderNumber}: `);

  return (
    <>
      <PageHeader title={`Order ${o.orderNumber}`} sub={new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}>
        <Link href="/admin/orders" className="btn btn-outline btn-sm print:hidden">← All orders</Link>
        <a href={`https://wa.me/91${digits(o.customer.phone).slice(-10)}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm border border-green-600 text-green-700 hover:bg-green-600 hover:text-white print:hidden">WhatsApp customer</a>
        <PrintButton />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="a-card p-0">
            <div className="flex items-center gap-3 px-5 py-4"><h2 className="text-base font-semibold">Items</h2><Badge value={o.status} /><Badge value={o.paymentStatus}>{o.paymentMethod.toUpperCase()} · {o.paymentStatus}</Badge></div>
            <ul className="divide-y divide-stone-100 border-t">
              {o.items.map((i, n) => (
                <li key={n} className="flex items-center gap-3 px-5 py-3">
                  <img src={imgSrc(i.image)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-stone-500">{[i.variantName, i.siddh && '✨ Energization requested', `${formatPrice(i.price)} × ${i.qty}`].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t px-5 py-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
              {o.siddhTotal > 0 && <div className="flex justify-between"><dt>Energization</dt><dd>{formatPrice(o.siddhTotal)}</dd></div>}
              {o.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon {o.couponCode}</dt><dd>−{formatPrice(o.discount)}</dd></div>}
              {o.prepaidDiscount > 0 && <div className="flex justify-between text-green-700"><dt>Online payment discount</dt><dd>−{formatPrice(o.prepaidDiscount)}</dd></div>}
              <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shipping ? formatPrice(o.shipping) : 'Free'}</dd></div>
              {o.codFee > 0 && <div className="flex justify-between"><dt>COD fee</dt><dd>{formatPrice(o.codFee)}</dd></div>}
              <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>{o.paymentMethod === 'cod' ? 'Collect on delivery' : 'Total'}</dt><dd>{formatPrice(o.total)}</dd></div>
            </dl>
          </div>

          <OrderActions order={serialize({ _id: o._id, status: o.status, paymentStatus: o.paymentStatus, tracking: o.tracking, adminNote: o.adminNote })} />

          <div className="a-card print:hidden">
            <h2 className="mb-3 text-base font-semibold">Timeline</h2>
            <ol className="space-y-2 text-sm">
              {[...o.history].reverse().map((h, n) => (
                <li key={n} className="flex gap-3"><span className="w-32 shrink-0 text-xs text-stone-400">{new Date(h.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span><span><b className="capitalize">{h.status}</b>{h.note ? ` — ${h.note}` : ''}</span></li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="a-card text-sm">
            <h2 className="mb-2 text-base font-semibold">Customer</h2>
            <p className="font-medium">{o.customer.name}</p>
            <p><a href={`tel:${o.customer.phone}`} className="text-maroon-800">{o.customer.phone}</a></p>
            {o.customer.email && <p className="break-all">{o.customer.email}</p>}
          </div>
          <div className="a-card text-sm">
            <h2 className="mb-2 text-base font-semibold">Shipping address</h2>
            <p>{o.customer.name}<br />{o.address.line1}{o.address.line2 && <><br />{o.address.line2}</>}{o.address.landmark && <><br />Landmark: {o.address.landmark}</>}<br />{o.address.city}, {o.address.state}<br /><b>{o.address.pincode}</b></p>
            <p className="mt-2">📞 {o.customer.phone}</p>
          </div>
          {o.customerNote && <div className="a-card text-sm"><h2 className="mb-2 text-base font-semibold">Customer note</h2><p className="whitespace-pre-line">{o.customerNote}</p></div>}
          {o.razorpay?.paymentId && <div className="a-card break-all text-xs text-stone-500 print:hidden">Razorpay payment: {o.razorpay.paymentId}</div>}
        </div>
      </div>
    </>
  );
}
