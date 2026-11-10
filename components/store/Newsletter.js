'use client';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'newsletter', email }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setState({ type: 'ok', msg: 'Thank you! You are subscribed 🙏' });
      setEmail('');
    } catch (err) {
      setState({ type: 'err', msg: err.message || 'Could not subscribe' });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit}>
      <p className="mb-2 text-sm text-stone-400">Offers and new arrivals, straight to your inbox.</p>
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-saffron-500" />
        <button disabled={busy} className="rounded-lg bg-saffron-600 px-4 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-60">Join</button>
      </div>
      {state.msg && <p className={`mt-2 text-xs ${state.type === 'ok' ? 'text-green-400' : 'text-red-300'}`}>{state.msg}</p>}
    </form>
  );
}
