import Link from 'next/link';
import Newsletter from './Newsletter';

export default function Footer({ settings, categories }) {
  const social = [
    ['Instagram', settings.instagram],
    ['Facebook', settings.facebook],
    ['YouTube', settings.youtube],
  ].filter(([, u]) => u);

  return (
    <footer className="mt-20 bg-maroon-950 text-stone-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-3xl font-bold text-amber-100">{settings.storeName}</p>
          <p className="mt-3 text-sm text-stone-400">{settings.tagline}</p>
          {social.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {social.map(([n, u]) => (
                <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="underline decoration-stone-600 hover:text-white">{n}</a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-200">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white">All products</Link></li>
            {categories.map((c) => (
              <li key={c.slug}><Link href={`/collections/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-200">Help</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/track-order" className="hover:text-white">Track order</Link></li>
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link href="/policies/shipping-policy" className="hover:text-white">Shipping policy</Link></li>
            <li><Link href="/policies/return-policy" className="hover:text-white">Return & replacement</Link></li>
            <li><Link href="/policies/privacy-policy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/policies/terms-of-service" className="hover:text-white">Terms of service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-200">Stay in touch</h4>
          <Newsletter />
          <div className="mt-4 space-y-1 text-sm text-stone-400">
            {settings.phone && <p>📞 {settings.phone}</p>}
            {settings.email && <p>✉️ {settings.email}</p>}
            {settings.address && <p className="whitespace-pre-line">📍 {settings.address}</p>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
