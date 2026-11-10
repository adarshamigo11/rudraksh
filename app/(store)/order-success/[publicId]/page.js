import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSettings } from '@/lib/settings';
import { formatPrice, imgSrc, digits } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmed', robots: { index: false } };

export default async function OrderSuccess({ params }) {
  await dbConnect();
  const o = await Order.findOne({ publicId: params.publicId }).lean();
  if (!o) notFound();
  const s = await getSettings();
  const wa = digits(s.whatsapp);
  const unpaidOnline = o.paymentMethod === 'online' && o.paymentStatus !== 'paid';

  return (
    <div className="container-x max-w-3xl py-12">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl text-green-700">✓</div>
        <h1 className="section-title mt-4">{unpaidOnline ? 'Order received' : 'Thank you for your order!'}</h1>
        <p className="mt-2 text-stone-600">
          Order <b className="text-maroon-900">{o.orderNumber}</b> {unpaidOnline ? 'is saved, but we have not received the payment yet.' : 'has been placed successfully. Har Har Mahadev 🙏'}
        </p>
        {unpaidOnline && <p className="mx-auto mt-3 max-w-md rounded-lg bg-amber-50 p-3 text-sm text-amber-800">If money was deducted, it will be confirmed shortly. Otherwise please contact us.</p>}
      </div>

      <div className="card mt-8 divide-y divide-stone-200">
        <div className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          <div>
            <p className="label">Delivering to</p>
            <p className="font-medium">{o.customer.name}</p>
            <p className="text-stone-600">{o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}<br />{o.address.city}, {o.address.state} – {o.address.pincode}</p>
            <p className="text-stone-600">📞 {o.customer.phone}</p>
          </div>
          <div>
            <p className="label">Payment</p>
            <p className="font-medium">{o.paymentMethod === 'cod' ? `Cash on Delivery — pay ${formatPrice(o.total)} on arrival` : o.paymentStatus === 'paid' ? 'Paid online' : 'Awaiting payment'}</p>
            <p className="label mt-3">Estimated delivery</p>
            <p className="text-stone-600">{s.deliveryMinDays}–{s.deliveryMaxDays} days</p>
          </div>
        </div>
        <ul className="divide-y divide-stone-100 px-5">
          {o.items.map((i, n) => (
            <li key={n} className="flex items-center gap-3 py-3">
              <img src={imgSrc(i.image)} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1 text-sm"><p className="font-medium">{i.name}</p><p className="text-xs text-stone-500">{[i.variantName, i.siddh && 'Energized', `Qty ${i.qty}`].filter(Boolean).join(' · ')}</p></div>
              <span className="text-sm">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 p-5 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
          {o.siddhTotal > 0 && <div className="flex justify-between"><dt>Energization</dt><dd>{formatPrice(o.siddhTotal)}</dd></div>}
          {o.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon</dt><dd>−{formatPrice(o.discount)}</dd></div>}
          {o.prepaidDiscount > 0 && <div className="flex justify-between text-green-700"><dt>Online discount</dt><dd>−{formatPrice(o.prepaidDiscount)}</dd></div>}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shipping ? formatPrice(o.shipping) : 'FREE'}</dd></div>
          {o.codFee > 0 && <div className="flex justify-between"><dt>COD handling</dt><dd>{formatPrice(o.codFee)}</dd></div>}
          <div className="flex justify-between border-t pt-2 text-base font-bold text-maroon-900"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/track-order" className="btn btn-dark">Track order</Link>
        <Link href="/shop" className="btn btn-outline">Continue shopping</Link>
        {wa && (
          <a className="btn border border-green-600 text-green-700 hover:bg-green-600 hover:text-white" target="_blank" rel="noopener noreferrer"
            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I placed order ${o.orderNumber}.`)}`}>
            Message us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
