'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';

const EMPTY = { name: '', description: '', image: '', order: 0, active: true };

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // null | 'new' | category
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const open = (c) => {
    setErr('');
    setEditing(c || 'new');
    setF(c ? { ...EMPTY, ...c } : EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const isNew = editing === 'new';
      const r = await fetch(isNew ? '/api/admin/categories' : `/api/admin/categories/${editing._id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
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
    if (!confirm(`Delete category “${c.name}”? Its products will stay but become uncategorised.`)) return;
    await fetch(`/api/admin/categories/${c._id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4"><button onClick={() => open(null)} className="btn btn-primary btn-sm">+ Add category</button></div>

      {editing && (
        <form onSubmit={save} className="a-card mb-6 space-y-4">
          <h2 className="font-semibold">{editing === 'new' ? 'New category' : `Edit ${editing.name}`}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2"><label className="label">Name *</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" /></div>
            <div><label className="label">Display order</label><input type="number" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} className="input" /></div>
          </div>
          <div><label className="label">Description</label><textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="input" /></div>
          <div><label className="label">Image</label><div className="max-w-[160px]"><ImageUploader single value={f.image} onChange={(v) => setF({ ...f, image: v })} /></div></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="accent-saffron-600" /> Visible in store</label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button disabled={busy} className="btn btn-primary btn-sm">{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline btn-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c._id} className="a-card flex gap-3 p-4">
            <img src={c.image || '/placeholder.svg'} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{c.name}</p>
              <p className="text-xs text-stone-500">{c.productCount} product{c.productCount === 1 ? '' : 's'} · order {c.order}{!c.active && ' · hidden'}</p>
              <div className="mt-2 flex gap-4 text-sm">
                <button onClick={() => open(c)} className="font-medium text-maroon-800 hover:underline">Edit</button>
                <button onClick={() => remove(c)} className="font-medium text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-stone-500">No categories yet.</p>}
      </div>
    </div>
  );
}
