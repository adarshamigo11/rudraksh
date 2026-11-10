'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push('/admin');
      router.refresh();
    } catch (e2) {
      setErr(e2.message || 'Login failed');
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-maroon-950 to-maroon-800 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-7 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-maroon-800 font-serif text-3xl text-amber-200">ॐ</div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-maroon-900">Admin login</h1>
        </div>
        <div><label className="label">Email</label><input type="email" required autoFocus value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="input" /></div>
        <div><label className="label">Password</label><input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="input" /></div>
        {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="btn btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
