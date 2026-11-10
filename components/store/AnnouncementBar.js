'use client';
import { useEffect, useState } from 'react';

export default function AnnouncementBar({ items = [] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  return (
    <div className="bg-maroon-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-amber-100 sm:text-sm">
      <span key={i} className="fade-in inline-block">{items[i]}</span>
    </div>
  );
}
