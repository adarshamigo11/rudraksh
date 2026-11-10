'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons';

export default function Header({ settings, categories }) {
  const { count, setOpen } = useCart();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearch(false);
    setMenu(false);
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const links = [
    { href: '/shop', label: 'All Products' },
    ...categories.map((c) => ({ href: `/collections/${c.slug}`, label: c.name })),
    { href: '/track-order', label: 'Track Order' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <button className="lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu"><MenuIcon className="h-6 w-6" /></button>

        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-maroon-800 font-serif text-xl text-amber-200">ॐ</span>
          <span className="font-serif text-2xl font-bold leading-none text-maroon-900">{settings.storeName}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-stone-700 transition hover:text-saffron-700">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => setSearch((s) => !s)} aria-label="Search"><SearchIcon className="h-5 w-5" /></button>
          <button onClick={() => setOpen(true)} className="relative" aria-label="Open cart">
            <CartIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-saffron-600 px-1 text-[11px] font-bold text-white">{count}</span>
            )}
          </button>
        </div>
      </div>

      {search && (
        <form onSubmit={submit} className="border-t bg-white">
          <div className="container-x flex gap-2 py-3">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rudraksha, bracelets, mala…" className="input" />
            <button className="btn btn-primary">Search</button>
          </div>
        </form>
      )}

      {menu && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/50 fade-in" onClick={() => setMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-xl font-bold text-maroon-900">{settings.storeName}</span>
              <button onClick={() => setMenu(false)} aria-label="Close menu"><CloseIcon /></button>
            </div>
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-saffron-50">{l.label}</Link>
                </li>
              ))}
              <li><Link href="/about" onClick={() => setMenu(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-saffron-50">About Us</Link></li>
              <li><Link href="/contact" onClick={() => setMenu(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-saffron-50">Contact</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
