import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { Badge, PageHeader } from '@/components/admin/ui';
import { escapeRegex, formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TABS = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default async function OrdersAdmin({ searchParams }) {
  await dbConnect();
  const status = TABS.includes(searchParams.status) ? searchParams.status : 'all';
  const q = (searchParams.q || '').trim();
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ orderNumber: rx }, { 'customer.name': rx }, { 'customer.phone': rx }, { 'address.pincode': rx }];
  }
  const [orders, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const cm = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const all = counts.reduce((s, c) => s + c.n, 0);

  return (
    <>
      <PageHeader title="Orders">
        <a href="/api/admin/orders/export" className="btn btn-outline btn-sm">⬇ Export CSV</a>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t} href={`/admin/orders?status=${t}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize ${status === t ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white hover:border-maroon-800'}`}>
            {t} <span className="opacity-70">{t === 'all' ? all : cm[t] || 0}</span>
          </Link>
        ))}
      </div>

      <form className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={status} />
        <input name="q" defaultValue={q} placeholder="Search order no., name, phone, pincode…" className="input max-w-sm" />
        <button className="btn btn-dark btn-sm">Search</button>
      </form>

      <div className="a-card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50"><tr><th className="a-th">Order</th><th className="a-th">Customer</th><th className="a-th">Items</th><th className="a-th">Total</th><th className="a-th">Payment</th><th className="a-th">Status</th></tr></thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-stone-50">
                <td className="a-td"><Link href={`/admin/orders/${o._id}`} className="font-semibold text-maroon-800">{o.orderNumber}</Link><p className="text-xs text-stone-400">{new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</p></td>
                <td className="a-td"><p className="font-medium">{o.customer?.name}</p><p className="text-xs text-stone-500">{o.customer?.phone} · {o.address?.city}</p></td>
                <td className="a-td text-stone-600">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td className="a-td font-medium">{formatPrice(o.total)}</td>
                <td className="a-td text-xs"><span className="uppercase">{o.paymentMethod}</span> <Badge value={o.paymentStatus} /></td>
                <td className="a-td"><Badge value={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-500">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
