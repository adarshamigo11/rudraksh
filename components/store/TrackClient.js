'use client';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

const STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
const LABEL = { pending: 'Order placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned' };

export default function TrackClient() {
  const [f, setF] = useState({ orderNumber: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setOrder(null);
    try {
      const r = await fetch('/api/orders/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOrder(d);
    } catch (e2) {
      setErr(e2.message || 'Could not find your order');
    }
    setBusy(false);
  };

  const idx = order ? STEPS.indexOf(order.status) : -1;
  const dead = order && ['cancelled', 'returned'].includes(order.status);

  return (
    <div className="container-x max-w-2xl py-12">
      <h1 className="section-title mb-2 text-center">Track your order</h1>
      <p className="mb-8 text-center text-stone-600">Enter your order number and the mobile number used while ordering.</p>

      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
        <div><label className="label">Order number</label><input required value={f.orderNumber} onChange={(e) => setF({ ...f, orderNumber: e.target.value })} placeholder="e.g. RK1001" className="input uppercase" /></div>
        <div><label className="label">Mobile number</label><input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" className="input" /></div>
        <button disabled={busy} className="btn btn-primary sm:col-span-2">{busy ? 'Searching…' : 'Track order'}</button>
      </form>

      {err && <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{err}</p>}

      {order && (
        <div className="card mt-6 space-y-6 p-5">
          <div className="flex flex-wrap justify-between gap-2">
            <div><p className="label">Order</p><p className="font-semibold">{order.orderNumber}</p></div>
            <div><p className="label">Placed on</p><p>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
            <div><p className="label">Total</p><p className="font-semibold">{formatPrice(order.total)}</p></div>
          </div>

          {dead ? (
            <p className="rounded-lg bg-red-50 p-4 text-center font-medium text-red-700">This order was {order.status}.</p>
          ) : (
            <ol className="grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs">
              {STEPS.map((s, n) => (
                <li key={s}>
                  <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${n <= idx ? 'bg-green-600 text-white' : 'bg-stone-200 text-stone-500'}`}>{n <= idx ? '✓' : n + 1}</div>
                  <p className={`mt-1 ${n <= idx ? 'font-semibold text-stone-900' : 'text-stone-400'}`}>{LABEL[s]}</p>
                </li>
              ))}
            </ol>
          )}

          {order.tracking?.number && (
            <div className="rounded-lg bg-saffron-50 p-4 text-sm">
              <p><b>{order.tracking.courier || 'Courier'}</b> · Tracking no. <b>{order.tracking.number}</b></p>
              {order.tracking.url && <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-maroon-800 underline">Track on courier website →</a>}
            </div>
          )}

          <ul className="text-sm text-stone-600">
            {order.items.map((i, n) => <li key={n}>• {i.name}{i.variantName ? ` (${i.variantName})` : ''} × {i.qty}</li>)}
          </ul>

          <ol className="space-y-2 border-t pt-4 text-sm">
            {[...order.history].reverse().map((h, n) => (
              <li key={n} className="flex gap-3">
                <span className="w-28 shrink-0 text-xs text-stone-400">{new Date(h.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span><b>{LABEL[h.status] || h.status}</b>{h.note ? ` — ${h.note}` : ''}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
