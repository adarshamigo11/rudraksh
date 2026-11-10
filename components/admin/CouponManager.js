'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

const EMPTY = { code: '', description: '', type: 'flat', value: '', minOrder: '', maxDiscount: '', expiresAt: '', usageLimit: '', showOnProduct: false, active: true };
const dateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function CouponManager({ coupons }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const open = (c) => {
    setErr('');
    setEditing(c || 'new');
    setF(c ? { ...EMPTY, ...c, expiresAt: dateInput(c.expiresAt), minOrder: c.minOrder || '', maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '' } : EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const isNew = editing === 'new';
      const { used, ...body } = f;
      const r = await fetch(isNew ? '/api/admin/coupons' : `/api/admin/coupons/${editing._id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setEditing(null);
      router.refresh();
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  };

  const remove = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await fetch(`/api/admin/coupons/${c._id}`, { method: 'DELETE' });
    router.refresh();
  };

  const toggle = async (c) => {
    await fetch(`/api/admin/coupons/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...c, active: !c.active }) });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4"><button onClick={() => open(null)} className="btn btn-primary btn-sm">+ Create coupon</button></div>

      {editing && (
        <form onSubmit={save} className="a-card mb-6 space-y-4">
          <h2 className="font-semibold">{editing === 'new' ? 'New coupon' : `Edit ${editing.code}`}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Code *</label><input required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="NAMASTE100" className="input font-mono uppercase" /></div>
            <div>
              <label className="label">Type</label>
              <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="input">
                <option value="flat">Flat amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div><label className="label">{f.type === 'percent' ? 'Percent off *' : 'Amount off ₹ *'}</label><input required type="number" min="1" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} className="input" /></div>
            <div><label className="label">Minimum order ₹</label><input type="number" min="0" value={f.minOrder} onChange={(e) => setF({ ...f, minOrder: e.target.value })} className="input" /></div>
            {f.type === 'percent' && <div><label className="label">Max discount ₹</label><input type="number" min="0" value={f.maxDiscount} onChange={(e) => setF({ ...f, maxDiscount: e.target.value })} className="input" /></div>}
            <div><label className="label">Usage limit</label><input type="number" min="0" value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} placeholder="Unlimited" className="input" /></div>
            <div><label className="label">Expires on</label><input type="date" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} className="input" /></div>
          </div>
          <div><label className="label">Description (shown to customers)</label><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="input" /></div>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.showOnProduct} onChange={(e) => setF({ ...f, showOnProduct: e.target.checked })} className="accent-saffron-600" /> Show on product pages</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="accent-saffron-600" /> Active</label>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button disabled={busy} className="btn btn-primary btn-sm">{busy ? 'Saving…' : 'Save coupon'}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline btn-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="a-card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50"><tr><th className="a-th">Code</th><th className="a-th">Discount</th><th className="a-th">Min order</th><th className="a-th">Used</th><th className="a-th">Expires</th><th className="a-th">Active</th><th className="a-th" /></tr></thead>
          <tbody className="divide-y divide-stone-100">
            {coupons.map((c) => (
              <tr key={c._id}>
                <td className="a-td font-mono font-bold">{c.code}{c.showOnProduct && <span className="ml-2 rounded bg-saffron-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-saffron-800">PUBLIC</span>}</td>
                <td className="a-td">{c.type === 'percent' ? `${c.value}%${c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}` : formatPrice(c.value)}</td>
                <td className="a-td">{c.minOrder ? formatPrice(c.minOrder) : '—'}</td>
                <td className="a-td">{c.used}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td className="a-td">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}</td>
                <td className="a-td"><input type="checkbox" checked={c.active} onChange={() => toggle(c)} className="h-4 w-4 accent-green-600" /></td>
                <td className="a-td whitespace-nowrap text-right">
                  <button onClick={() => open(c)} className="mr-4 text-sm font-medium text-maroon-800 hover:underline">Edit</button>
                  <button onClick={() => remove(c)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-500">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
