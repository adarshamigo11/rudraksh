'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '', website: '' });
  const [state, setState] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, type: 'contact' }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setState({ type: 'ok', text: 'Thank you! We will get back to you soon 🙏' });
      setF({ name: '', email: '', phone: '', message: '', website: '' });
    } catch (err) {
      setState({ type: 'err', text: err.message || 'Could not send message' });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Name *</label><input required value={f.name} onChange={set('name')} className="input" /></div>
        <div><label className="label">Phone</label><input value={f.phone} onChange={set('phone')} inputMode="tel" className="input" /></div>
      </div>
      <div><label className="label">Email</label><input type="email" value={f.email} onChange={set('email')} className="input" /></div>
      <div><label className="label">Message *</label><textarea required rows={5} value={f.message} onChange={set('message')} className="input" /></div>
      <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden="true" />
      {state.text && <p className={`rounded-lg px-4 py-3 text-sm ${state.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{state.text}</p>}
      <button disabled={busy} className="btn btn-primary">{busy ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
