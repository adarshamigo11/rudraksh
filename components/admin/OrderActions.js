'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrderActions({ order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState(order.paymentStatus);
  const [t, setT] = useState({ courier: order.tracking?.courier || '', number: order.tracking?.number || '', url: order.tracking?.url || '' });
  const [adminNote, setAdminNote] = useState(order.adminNote || '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    if (['cancelled', 'returned'].includes(status) && status !== order.status && !confirm('This will put the items back into stock. Continue?')) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus: payment, tracking: t, adminNote, note }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMsg('Saved ✓');
      setNote('');
      router.refresh();
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="a-card space-y-4 print:hidden">
      <h2 className="text-base font-semibold">Manage order</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Order status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input capitalize">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="label">Payment status</label>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="input capitalize">{['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select>
        </div>
      </div>
      {status !== order.status && <div><label className="label">Note for timeline (optional)</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Handed to courier" className="input" /></div>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">Courier</label><input value={t.courier} onChange={(e) => setT({ ...t, courier: e.target.value })} placeholder="Delhivery" className="input" /></div>
        <div><label className="label">Tracking number</label><input value={t.number} onChange={(e) => setT({ ...t, number: e.target.value })} className="input" /></div>
        <div><label className="label">Tracking link</label><input value={t.url} onChange={(e) => setT({ ...t, url: e.target.value })} placeholder="https://…" className="input" /></div>
      </div>
      <div><label className="label">Private note (only you see this)</label><textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="input" /></div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="btn btn-primary btn-sm">{busy ? 'Saving…' : 'Save changes'}</button>
        {msg && <span className={`text-sm ${msg.includes('✓') ? 'text-green-700' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}
