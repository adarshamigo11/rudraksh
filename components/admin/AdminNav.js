'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  ['/admin', 'Dashboard', '📊'],
  ['/admin/products', 'Products', '📿'],
  ['/admin/categories', 'Categories', '🗂️'],
  ['/admin/orders', 'Orders', '📦'],
  ['/admin/coupons', 'Coupons', '🏷️'],
  ['/admin/reviews', 'Reviews', '⭐'],
  ['/admin/messages', 'Messages', '✉️'],
  ['/admin/settings', 'Settings', '⚙️'],
];

export default function AdminNav({ storeName, pendingOrders = 0, pendingReviews = 0 }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const badge = { '/admin/orders': pendingOrders, '/admin/reviews': pendingReviews };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const nav = (
    <nav className="flex h-full flex-col p-4">
      <div className="mb-6 px-2">
        <p className="font-serif text-2xl font-bold text-amber-100">{storeName}</p>
        <p className="text-xs text-stone-400">Admin panel</p>
      </div>
      <ul className="space-y-1">
        {LINKS.map(([href, label, icon]) => {
          const active = href === '/admin' ? path === '/admin' : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-white/15 text-white' : 'text-stone-300 hover:bg-white/10'}`}>
                <span>{icon}</span>{label}
                {badge[href] > 0 && <span className="ml-auto rounded-full bg-saffron-600 px-2 py-0.5 text-[11px] font-bold text-white">{badge[href]}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a href="/" target="_blank" className="block rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/10">↗ View store</a>
        <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-stone-300 hover:bg-white/10">⎋ Log out</button>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-maroon-950 lg:block print:hidden">{nav}</aside>
      <div className="flex items-center justify-between bg-maroon-950 px-4 py-3 text-white lg:hidden print:hidden">
        <span className="font-serif text-xl font-bold text-amber-100">{storeName} · Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Menu" className="text-2xl">☰</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-maroon-950">{nav}</div>
        </div>
      )}
    </>
  );
}
