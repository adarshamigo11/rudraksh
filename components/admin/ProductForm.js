'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { uploadImages } from './upload';

const EMPTY = {
  name: '', slug: '', shortDescription: '', description: '', images: [], category: '',
  price: '', comparePrice: '', sku: '', stock: '', variantLabel: 'Size', variants: [],
  siddhAvailable: true, specs: [], faqs: [], tagsText: '', featured: false, bestseller: false,
  active: true, seoTitle: '', seoDescription: '',
};

const Section = ({ title, hint, children }) => (
  <section className="a-card space-y-4">
    <div><h2 className="text-base font-semibold text-stone-900">{title}</h2>{hint && <p className="text-xs text-stone-500">{hint}</p>}</div>
    {children}
  </section>
);

export default function ProductForm({ product, categories }) {
  const router = useRouter();
  const descRef = useRef(null);
  const imgRef = useRef(null);
  const [f, setF] = useState(() =>
    product
      ? { ...EMPTY, ...product, category: product.category || '', tagsText: (product.tags || []).join(', '), price: product.price ?? '', comparePrice: product.comparePrice || '', stock: product.stock ?? '' }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const hasVariants = f.variants.length > 0;

  const updateRow = (key, i, patch) => set(key, f[key].map((r, n) => (n === i ? { ...r, ...patch } : r)));
  const removeRow = (key, i) => set(key, f[key].filter((_, n) => n !== i));

  const insertAtCursor = (text) => {
    const el = descRef.current;
    const pos = el ? el.selectionStart : f.description.length;
    const before = f.description.slice(0, pos);
    const after = f.description.slice(pos);
    const pad = before && !before.endsWith('\n') ? '\n' : '';
    set('description', `${before}${pad}${text}\n${after}`);
    setTimeout(() => el?.focus(), 0);
  };

  const wrapSelection = (mark) => {
    const el = descRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = f.description.slice(a, b) || 'text';
    set('description', `${f.description.slice(0, a)}${mark}${sel}${mark}${f.description.slice(b)}`);
  };

  const addDescImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const [url] = await uploadImages([file]);
      insertAtCursor(`![](${url})`);
    } catch (e2) {
      alert(e2.message);
    }
  };

  const save = async () => {
    setErr('');
    if (!f.name.trim()) return setErr('Product name is required');
    if (!hasVariants && (f.price === '' || Number(f.price) < 0)) return setErr('Please enter the price');
    if (hasVariants && f.variants.some((v) => !v.name?.trim() || v.price === '' || v.price === undefined)) return setErr('Every variant needs a name and a price');
    setSaving(true);
    try {
      const { tagsText, ...rest } = f;
      const body = {
        ...rest,
        tags: tagsText.split(','),
        price: Number(f.price || 0),
        comparePrice: Number(f.comparePrice || 0),
        stock: Number(f.stock || 0),
        variants: f.variants.map((v) => ({ ...v, price: Number(v.price || 0), comparePrice: Number(v.comparePrice || 0), stock: Number(v.stock || 0) })),
      };
      const res = await fetch(product ? `/api/admin/products/${product._id}` : '/api/admin/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Could not save');
      router.push('/admin/products');
      router.refresh();
    } catch (e) {
      setErr(e.message);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const Toggle = ({ k, label }) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={!!f[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-saffron-600" /> {label}
    </label>
  );

  return (
    <div className="pb-24">
      {err && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Basic information">
            <div><label className="label">Product name *</label><input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. 5 Mukhi Rudraksha Bracelet" className="input" /></div>
            <div><label className="label">Short description</label><textarea rows={2} value={f.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="One or two lines shown near the price" className="input" /></div>
          </Section>

          <Section title="Images" hint="Upload up to 10 images. Large photos are resized automatically.">
            <ImageUploader value={f.images} onChange={(v) => set('images', v)} max={10} />
          </Section>

          <Section title="Description" hint="Use the buttons to format. Headings start with ##, bullets with -, images are added with the picture button.">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => insertAtCursor('## Heading')}>Heading</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => insertAtCursor('- Bullet point')}>• Bullet</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => wrapSelection('**')}>Bold</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => imgRef.current?.click()}>🖼 Insert image</button>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={addDescImage} />
            </div>
            <textarea ref={descRef} rows={14} value={f.description} onChange={(e) => set('description', e.target.value)} className="input font-mono text-[13px]" placeholder={'## About this product\nWrite about the beads, size, origin...\n\n## Care instructions\n- Keep away from water\n- Store in a dry pouch'} />
          </Section>

          <Section title="Variants" hint="Optional — add sizes or types (e.g. Small / Regular / Large). Each variant has its own price and stock.">
            {hasVariants && (
              <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
                <div className="col-span-2"><label className="label">Variant label</label><input value={f.variantLabel} onChange={(e) => set('variantLabel', e.target.value)} className="input" placeholder="Size" /></div>
              </div>
            )}
            {f.variants.map((v, i) => (
              <div key={v._id || i} className="grid grid-cols-2 gap-3 rounded-lg border border-stone-200 p-3 sm:grid-cols-5">
                <div className="col-span-2 sm:col-span-2"><label className="label">Name</label><input value={v.name || ''} onChange={(e) => updateRow('variants', i, { name: e.target.value })} placeholder="Regular" className="input" /></div>
                <div><label className="label">Price ₹</label><input type="number" min="0" value={v.price ?? ''} onChange={(e) => updateRow('variants', i, { price: e.target.value })} className="input" /></div>
                <div><label className="label">MRP ₹</label><input type="number" min="0" value={v.comparePrice || ''} onChange={(e) => updateRow('variants', i, { comparePrice: e.target.value })} className="input" /></div>
                <div className="flex items-end gap-2">
                  <div className="flex-1"><label className="label">Stock</label><input type="number" min="0" value={v.stock ?? ''} onChange={(e) => updateRow('variants', i, { stock: e.target.value })} className="input" /></div>
                  <button type="button" onClick={() => removeRow('variants', i)} className="pb-2 text-red-600" aria-label="Remove variant">✕</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => set('variants', [...f.variants, { name: '', price: f.price || '', comparePrice: f.comparePrice || '', stock: f.stock || '' }])} className="btn btn-outline btn-sm">+ Add variant</button>
          </Section>

          <Section title="Product details" hint="Shown as a table on the product page — e.g. Mukhi: 5, Bead size: 7 mm, Origin: Nepal.">
            {f.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input value={s.key || ''} onChange={(e) => updateRow('specs', i, { key: e.target.value })} placeholder="Label" className="input w-1/3" />
                <input value={s.value || ''} onChange={(e) => updateRow('specs', i, { value: e.target.value })} placeholder="Value" className="input flex-1" />
                <button type="button" onClick={() => removeRow('specs', i)} className="px-2 text-red-600" aria-label="Remove">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => set('specs', [...f.specs, { key: '', value: '' }])} className="btn btn-outline btn-sm">+ Add detail</button>
          </Section>

          <Section title="FAQs" hint="Optional questions customers often ask about this product.">
            {f.faqs.map((q, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-stone-200 p-3">
                <div className="flex gap-2">
                  <input value={q.q || ''} onChange={(e) => updateRow('faqs', i, { q: e.target.value })} placeholder="Question" className="input" />
                  <button type="button" onClick={() => removeRow('faqs', i)} className="px-2 text-red-600" aria-label="Remove">✕</button>
                </div>
                <textarea rows={2} value={q.a || ''} onChange={(e) => updateRow('faqs', i, { a: e.target.value })} placeholder="Answer" className="input" />
              </div>
            ))}
            <button type="button" onClick={() => set('faqs', [...f.faqs, { q: '', a: '' }])} className="btn btn-outline btn-sm">+ Add FAQ</button>
          </Section>

          <Section title="Search engine listing" hint="Optional. Leave empty to use the product name and short description.">
            <div><label className="label">SEO title</label><input value={f.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} className="input" /></div>
            <div><label className="label">SEO description</label><textarea rows={2} value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} className="input" /></div>
            <div><label className="label">URL slug</label><input value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated from the name" className="input" /></div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Status">
            <Toggle k="active" label="Visible in store" />
            <Toggle k="featured" label="Featured on homepage" />
            <Toggle k="bestseller" label="Show in Bestsellers" />
            <Toggle k="siddhAvailable" label="Offer energization add-on" />
          </Section>

          <Section title="Organization">
            <div>
              <label className="label">Category</label>
              <select value={f.category} onChange={(e) => set('category', e.target.value)} className="input">
                <option value="">— None —</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Tags</label><input value={f.tagsText} onChange={(e) => set('tagsText', e.target.value)} placeholder="bracelet, 5 mukhi, gift" className="input" /><p className="mt-1 text-xs text-stone-500">Comma separated. Used in search.</p></div>
          </Section>

          <Section title="Pricing & stock" hint={hasVariants ? 'Prices and stock are set per variant.' : undefined}>
            {!hasVariants && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Price ₹ *</label><input type="number" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} className="input" /></div>
                  <div><label className="label">MRP ₹</label><input type="number" min="0" value={f.comparePrice} onChange={(e) => set('comparePrice', e.target.value)} className="input" /></div>
                </div>
                <p className="-mt-2 text-xs text-stone-500">MRP is shown struck-through to display a discount.</p>
                <div><label className="label">Stock quantity</label><input type="number" min="0" value={f.stock} onChange={(e) => set('stock', e.target.value)} className="input" /></div>
              </>
            )}
            <div><label className="label">SKU</label><input value={f.sku} onChange={(e) => set('sku', e.target.value)} className="input" /></div>
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
          <button type="button" onClick={() => router.push('/admin/products')} className="btn btn-outline btn-sm">Cancel</button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}</button>
        </div>
      </div>
    </div>
  );
}
