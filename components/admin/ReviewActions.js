'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewActions({ id, approved }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    await fetch(`/api/admin/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: !approved }) });
    router.refresh();
    setBusy(false);
  };
  const remove = async () => {
    if (!confirm('Delete this review?')) return;
    setBusy(true);
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    router.refresh();
    setBusy(false);
  };

  return (
    <div className="flex gap-3 text-sm">
      <button onClick={toggle} disabled={busy} className={`font-medium hover:underline ${approved ? 'text-amber-600' : 'text-green-700'}`}>{approved ? 'Unapprove' : 'Approve'}</button>
      <button onClick={remove} disabled={busy} className="font-medium text-red-600 hover:underline">Delete</button>
    </div>
  );
}
