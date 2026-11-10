import Link from 'next/link';
import Stars from './Stars';
import { formatPrice, discountPercent, inStock, imgSrc } from '@/lib/utils';

export default function ProductCard({ p }) {
  const off = discountPercent(p.price, p.comparePrice);
  const soldOut = !inStock(p);
  const [a, b] = p.images || [];
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
        <img src={imgSrc(a)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {b && <img src={b} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        {off > 0 && !soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-maroon-800 px-2.5 py-1 text-[11px] font-bold text-white">{off}% OFF</span>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-white">Sold out</span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-sans text-sm font-medium text-stone-900 group-hover:text-saffron-700">{p.name}</h3>
      {p.ratingCount > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          <Stars value={p.ratingAvg} className="h-3.5 w-3.5" /> ({p.ratingCount})
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        {p.variants?.length > 0 && <span className="text-xs text-stone-500">From</span>}
        <span className="text-base font-bold text-maroon-900">{formatPrice(p.price)}</span>
        {p.comparePrice > p.price && <span className="text-sm text-stone-400 line-through">{formatPrice(p.comparePrice)}</span>}
      </div>
    </Link>
  );
}
