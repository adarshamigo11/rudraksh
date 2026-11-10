'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { formatPrice, imgSrc } from '@/lib/utils';

export default function CartLines({ onNavigate }) {
  const { items, setQty, remove, toggleSiddh, settings } = useCart();
  return (
    <ul className="divide-y divide-stone-200">
      {items.map((i) => (
        <li key={i.key} className="flex gap-3 py-4">
          <Link href={`/products/${i.slug}`} onClick={onNavigate} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            <img src={imgSrc(i.image)} alt={i.name} className="h-full w-full object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <Link href={`/products/${i.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-medium text-stone-900">
                {i.name}
              </Link>
              <button onClick={() => remove(i.key)} className="text-xs text-stone-400 hover:text-maroon-700" aria-label="Remove item">
                Remove
              </button>
            </div>
            {i.variantName && <p className="text-xs text-stone-500">{i.variantName}</p>}
            {settings.siddhPrice > 0 && i.siddhAvailable && (
              <label className="mt-1 flex cursor-pointer items-center gap-1.5 text-xs text-stone-600">
                <input type="checkbox" checked={!!i.siddh} onChange={() => toggleSiddh(i.key)} className="accent-saffron-600" />
                Energized (Pran Pratishta) +{formatPrice(settings.siddhPrice)}
              </label>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center rounded-full border border-stone-300">
                <button onClick={() => setQty(i.key, i.qty - 1)} className="h-7 w-7 text-lg leading-none" aria-label="Decrease">−</button>
                <span className="w-7 text-center text-sm">{i.qty}</span>
                <button onClick={() => setQty(i.key, i.qty + 1)} disabled={i.qty >= (i.maxQty || 10)} className="h-7 w-7 text-lg leading-none disabled:opacity-30" aria-label="Increase">+</button>
              </div>
              <div className="text-sm font-semibold">{formatPrice(i.price * i.qty)}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
