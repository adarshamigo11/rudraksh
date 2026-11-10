'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ url, label = 'Delete', confirmText = 'Delete this item? This cannot be undone.', redirect, className = '' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!confirm(confirmText)) return;
    setBusy(true);
    const r = await fetch(url, { method: 'DELETE' });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      alert(d.error || 'Could not delete');
      setBusy(false);
      return;
    }
    if (redirect) router.push(redirect);
    router.refresh();
    setBusy(false);
  };

  return (
    <button onClick={go} disabled={busy} className={`text-sm font-medium text-red-600 hover:underline disabled:opacity-50 ${className}`}>
      {busy ? '…' : label}
    </button>
  );
}
