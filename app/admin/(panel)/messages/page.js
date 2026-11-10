import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import DeleteButton from '@/components/admin/DeleteButton';
import { PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function MessagesAdmin() {
  await dbConnect();
  const [messages, subs] = await Promise.all([
    Lead.find({ type: 'contact' }).sort({ createdAt: -1 }).limit(200).lean(),
    Lead.find({ type: 'newsletter' }).sort({ createdAt: -1 }).limit(1000).lean(),
  ]);

  return (
    <>
      <PageHeader title="Messages" sub="Contact form messages and newsletter subscribers" />
      <h2 className="mb-3 text-base font-semibold">Contact messages ({messages.length})</h2>
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m._id} className="a-card">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <b>{m.name}</b>
              {m.phone && <a href={`tel:${m.phone}`} className="text-maroon-800">{m.phone}</a>}
              {m.email && <a href={`mailto:${m.email}`} className="text-maroon-800">{m.email}</a>}
              <span className="text-xs text-stone-400">{new Date(m.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}</span>
              <DeleteButton url={`/api/admin/leads/${m._id}`} className="ml-auto" confirmText="Delete this message?" />
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-stone-600">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="a-card text-center text-sm text-stone-500">No messages yet.</p>}
      </div>

      <h2 className="mb-3 mt-10 text-base font-semibold">Newsletter subscribers ({subs.length})</h2>
      <div className="a-card">
        {subs.length === 0 ? <p className="text-sm text-stone-500">No subscribers yet.</p> : (
          <>
            <textarea readOnly rows={Math.min(8, subs.length)} className="input font-mono text-xs" value={subs.map((s) => s.email).join(', ')} />
            <p className="mt-2 text-xs text-stone-500">Select all and copy to use in your email tool.</p>
          </>
        )}
      </div>
    </>
  );
}
