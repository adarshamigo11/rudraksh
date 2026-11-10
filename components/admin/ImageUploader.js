'use client';
import { useRef, useState } from 'react';
import { uploadImages } from './upload';

export default function ImageUploader({ value = [], onChange, max = 10, single = false }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const list = single ? (value ? [value] : []) : value;
  const emit = (arr) => onChange(single ? arr[0] || '' : arr);

  const pick = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const room = single ? 1 : max - list.length;
    if (room <= 0) return setErr(`You can add up to ${max} images`);
    setBusy(true);
    setErr('');
    try {
      const urls = await uploadImages(files.slice(0, room));
      emit(single ? urls.slice(0, 1) : [...list, ...urls]);
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  };

  const move = (i, d) => {
    const a = [...list];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    emit(a);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {list.map((src, i) => (
          <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && !single && <span className="absolute left-1 top-1 rounded bg-maroon-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-1 text-white opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
              {!single ? (
                <>
                  <button type="button" onClick={() => move(i, -1)} className="px-1.5 text-sm" aria-label="Move left">←</button>
                  <button type="button" onClick={() => emit(list.filter((_, n) => n !== i))} className="px-1.5 text-sm text-red-300" aria-label="Remove">✕</button>
                  <button type="button" onClick={() => move(i, 1)} className="px-1.5 text-sm" aria-label="Move right">→</button>
                </>
              ) : (
                <button type="button" onClick={() => emit([])} className="mx-auto px-1.5 text-xs text-red-300">Remove</button>
              )}
            </div>
          </div>
        ))}
        {(single ? list.length === 0 : list.length < max) && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-stone-300 text-center text-xs text-stone-500 hover:border-saffron-600 hover:text-saffron-700 disabled:opacity-60"
          >
            {busy ? 'Uploading…' : <span><span className="block text-2xl leading-none">+</span>Add image{single ? '' : 's'}</span>}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={!single} onChange={pick} className="hidden" />
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      {!single && list.length > 1 && <p className="mt-2 text-xs text-stone-500">The first image is the main product image. Use the arrows to reorder.</p>}
    </div>
  );
}
