'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';

const SECTIONS = [
  { title: 'Store', fields: [['storeName', 'Store name'], ['tagline', 'Tagline'], ['aboutText', 'About us text (blank line = new paragraph)', 'textarea'], ['announcements', 'Announcement bar messages (one per line)', 'lines']] },
  { title: 'Homepage hero', fields: [['heroTitle', 'Title'], ['heroSubtitle', 'Subtitle', 'textarea'], ['heroCta', 'Button text'], ['heroImage', 'Background image (optional)', 'image']] },
  { title: 'Shipping & payments', fields: [['freeShippingMin', 'Free shipping above (₹, 0 = never free)', 'number'], ['shippingFee', 'Shipping fee (₹)', 'number'], ['codEnabled', 'Enable Cash on Delivery', 'toggle'], ['codFee', 'COD handling fee (₹)', 'number'], ['prepaidDiscount', 'Discount for paying online (₹)', 'number'], ['siddhPrice', 'Energization (Pran Pratishta) add-on price (₹, 0 = hide)', 'number'], ['deliveryMinDays', 'Delivery — minimum days', 'number'], ['deliveryMaxDays', 'Delivery — maximum days', 'number']] },
  { title: 'Policies', fields: [['returnDays', 'Report damaged/wrong item within (days, 0 = hide)', 'number'], ['replacementMonths', 'Free replacement period (months, 0 = hide)', 'number']] },
  { title: 'Contact & social', fields: [['whatsapp', 'WhatsApp number with country code (e.g. 919876543210)'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address', 'textarea'], ['instagram', 'Instagram URL'], ['facebook', 'Facebook URL'], ['youtube', 'YouTube URL']] },
];

export default function SettingsForm({ settings }) {
  const router = useRouter();
  const [s, setS] = useState({ ...settings, announcements: (settings.announcements || []).join('\n') });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ ok: true, text: '' });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ ok: true, text: '' });
    try {
      const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMsg({ ok: true, text: 'Settings saved ✓' });
      router.refresh();
    } catch (e2) {
      setMsg({ ok: false, text: e2.message });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-20">
      {SECTIONS.map((sec) => (
        <section key={sec.title} className="a-card space-y-4">
          <h2 className="text-base font-semibold">{sec.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sec.fields.map(([key, label, type]) => (
              <div key={key} className={type === 'textarea' || type === 'lines' || type === 'image' ? 'sm:col-span-2' : ''}>
                {type === 'toggle' ? (
                  <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={!!s[key]} onChange={(e) => setS({ ...s, [key]: e.target.checked })} className="h-4 w-4 accent-saffron-600" /> {label}</label>
                ) : (
                  <>
                    <label className="label">{label}</label>
                    {type === 'textarea' || type === 'lines' ? (
                      <textarea rows={type === 'lines' ? 3 : 4} value={s[key] ?? ''} onChange={(e) => setS({ ...s, [key]: e.target.value })} className="input" />
                    ) : type === 'image' ? (
                      <div className="max-w-[220px]"><ImageUploader single value={s[key]} onChange={(v) => setS({ ...s, [key]: v })} /></div>
                    ) : (
                      <input type={type === 'number' ? 'number' : 'text'} min={type === 'number' ? 0 : undefined} value={s[key] ?? ''} onChange={(e) => setS({ ...s, [key]: e.target.value })} className="input" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-4">
          {msg.text && <span className={`text-sm ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</span>}
          <button disabled={busy} className="btn btn-primary btn-sm">{busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </div>
    </form>
  );
}
