import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { Badge, PageHeader } from '@/components/admin/ui';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ist = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export default async function Dashboard() {
  await dbConnect();
  const live = { status: { $nin: ['cancelled', 'returned'] } };
  const since = new Date(Date.now() - 7 * 864e5);
  const today = ist(new Date());

  const [totals, daily, pending, productCount, lowStock, recent] = await Promise.all([
    Order.aggregate([{ $match: live }, { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { ...live, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
    Product.countDocuments(),
    Product.find({
      active: true,
      $or: [
        { variants: { $size: 0 }, stock: { $lte: 5 } },
        { variants: { $elemMatch: { stock: { $lte: 5 } } } },
      ],
    }).select('name stock variants').limit(8).lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const byDay = new Map(daily.map((d) => [d._id, d]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = ist(Date.now() - (6 - i) * 864e5);
    return { key, label: new Date(key).toLocaleDateString('en-IN', { weekday: 'short' }), ...(byDay.get(key) || { revenue: 0, count: 0 }) };
  });
  const maxRev = Math.max(1, ...days.map((d) => d.revenue));
  const todayData = byDay.get(today) || { revenue: 0, count: 0 };
  const t = totals[0] || { revenue: 0, count: 0 };

  const stats = [
    ['Total sales', formatPrice(t.revenue), `${t.count} orders`],
    ["Today's sales", formatPrice(todayData.revenue), `${todayData.count} orders`],
    ['Pending orders', pending, 'need confirmation'],
    ['Products', productCount, `${lowStock.length} low on stock`],
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([l, v, s]) => (
          <div key={l} className="a-card"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{l}</p><p className="mt-1 text-2xl font-bold text-stone-900">{v}</p><p className="text-xs text-stone-400">{s}</p></div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="a-card lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Last 7 days</h2>
          <div className="flex h-44 items-end gap-3">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-stone-500">{d.revenue ? formatPrice(d.revenue) : ''}</span>
                <div className="w-full rounded-t bg-saffron-500" style={{ height: `${Math.max(3, (d.revenue / maxRev) * 100)}%`, opacity: d.revenue ? 1 : 0.25 }} title={`${d.count} orders`} />
                <span className="text-xs text-stone-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="a-card">
          <h2 className="mb-3 text-base font-semibold">Low stock</h2>
          {lowStock.length === 0 ? <p className="text-sm text-stone-500">All products are well stocked 👍</p> : (
            <ul className="divide-y divide-stone-100 text-sm">
              {lowStock.map((p) => (
                <li key={p._id}>
                  <Link href={`/admin/products/${p._id}`} className="flex justify-between gap-2 py-2 hover:text-maroon-800">
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 font-semibold text-amber-600">
                      {p.variants?.length ? p.variants.filter((v) => v.stock <= 5).map((v) => `${v.name}: ${v.stock}`).join(', ') : p.stock}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="a-card mt-6 overflow-x-auto p-0">
        <div className="flex items-center justify-between px-5 py-4"><h2 className="text-base font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm text-maroon-800 underline">View all</Link></div>
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50"><tr><th className="a-th">Order</th><th className="a-th">Customer</th><th className="a-th">Total</th><th className="a-th">Payment</th><th className="a-th">Status</th></tr></thead>
          <tbody className="divide-y divide-stone-100">
            {recent.map((o) => (
              <tr key={o._id} className="hover:bg-stone-50">
                <td className="a-td"><Link href={`/admin/orders/${o._id}`} className="font-semibold text-maroon-800">{o.orderNumber}</Link><p className="text-xs text-stone-400">{new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</p></td>
                <td className="a-td">{o.customer?.name}</td>
                <td className="a-td font-medium">{formatPrice(o.total)}</td>
                <td className="a-td uppercase text-xs">{o.paymentMethod} · <Badge value={o.paymentStatus} /></td>
                <td className="a-td"><Badge value={o.status} /></td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-500">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
