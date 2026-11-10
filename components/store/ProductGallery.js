'use client';
import { useState } from 'react';
import { imgSrc } from '@/lib/utils';

export default function ProductGallery({ images = [], name }) {
  const list = images.length ? images : [''];
  const [i, setI] = useState(0);
  const go = (d) => setI((x) => (x + d + list.length) % list.length);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
        <img src={imgSrc(list[i])} alt={name} className="h-full w-full object-cover" />
        {list.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl shadow hover:bg-white">‹</button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl shadow hover:bg-white">›</button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">{i + 1} / {list.length}</span>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, n) => (
            <button key={n} onClick={() => setI(n)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 sm:h-20 sm:w-20 ${n === i ? 'border-maroon-800' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={imgSrc(src)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
