'use client';
import { useState } from 'react';
import Stars from './Stars';
import { StarIcon } from './Icons';

export default function ReviewSection({ productId, reviews = [], avg = 0, count = 0 }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', rating: 5, title: '', comment: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, productId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMsg({ type: 'ok', text: 'Thank you! Your review will appear after approval.' });
      setOpen(false);
      setF({ name: '', rating: 5, title: '', comment: '', website: '' });
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Could not submit review' });
    }
    setBusy(false);
  };

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-maroon-900">Customer reviews</h2>
          {count > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-stone-600"><Stars value={avg} className="h-5 w-5" /> {avg} out of 5 · {count} review{count > 1 ? 's' : ''}</p>
          ) : (
            <p className="mt-1 text-sm text-stone-500">No reviews yet — be the first!</p>
          )}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="btn btn-outline btn-sm">{open ? 'Cancel' : 'Write a review'}</button>
      </div>

      {msg.text && <p className={`mt-4 rounded-lg px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}

      {open && (
        <form onSubmit={submit} className="card mt-5 space-y-4 p-5">
          <div>
            <p className="label">Your rating</p>
            <div className="flex gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setF({ ...f, rating: n })} aria-label={`${n} stars`}>
                  <StarIcon className="h-8 w-8" filled={f.rating >= n} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Name</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" /></div>
            <div><label className="label">Review title</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="input" /></div>
          </div>
          <div><label className="label">Your review</label><textarea required rows={4} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} className="input" /></div>
          <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} className="hidden" aria-hidden="true" />
          <button disabled={busy} className="btn btn-primary">{busy ? 'Submitting…' : 'Submit review'}</button>
        </form>
      )}

      <div className="mt-6 divide-y divide-stone-200">
        {reviews.map((r) => (
          <article key={r._id} className="py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-maroon-100 font-semibold text-maroon-800">{r.name[0]?.toUpperCase()}</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">{r.name}</p>
                <p className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <Stars value={r.rating} className="ml-auto h-4 w-4" />
            </div>
            {r.title && <p className="mt-3 font-semibold text-stone-900">{r.title}</p>}
            <p className="mt-1 text-sm text-stone-600">{r.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
