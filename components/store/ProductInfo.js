'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import Stars from './Stars';
import { TruckIcon, ShieldIcon, LockIcon } from './Icons';
import { formatPrice, discountPercent } from '@/lib/utils';

export default function ProductInfo({ product: p, coupons = [] }) {
  const { add, settings } = useCart();
  const router = useRouter();
  const hasVariants = p.variants?.length > 0;
  const firstAvail = hasVariants ? p.variants.find((v) => v.stock > 0) || p.variants[0] : null;
  const [variantId, setVariantId] = useState(firstAvail?._id || '');
  const [siddh, setSiddh] = useState(false);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState('');
  const [pinRes, setPinRes] = useState(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [copied, setCopied] = useState('');

  const variant = hasVariants ? p.variants.find((v) => v._id === variantId) : null;
  const price = variant ? variant.price : p.price;
  const compare = variant ? variant.comparePrice : p.comparePrice;
  const stock = variant ? variant.stock : p.stock;
  const off = discountPercent(price, compare);
  const siddhOn = settings.siddhPrice > 0 && p.siddhAvailable;
  const maxQty = Math.min(10, stock);
  const soldOut = stock < 1;

  const line = useMemo(
    () => ({
      productId: p._id, slug: p.slug, name: p.name, image: p.images?.[0] || '',
      variantId: variant?._id || '', variantName: variant?.name || '',
      price, comparePrice: compare, qty, siddh: siddhOn && siddh, siddhAvailable: siddhOn, maxQty: Math.min(10, stock),
    }),
    [p, variant, price, compare, qty, siddh, siddhOn, stock]
  );

  const addToCart = () => add(line, true);
  const buyNow = (cod) => {
    add(line, false);
    router.push(cod ? '/checkout?pay=cod' : '/checkout');
  };

  const checkPin = async () => {
    if (!/^[1-9]\d{5}$/.test(pin)) return setPinRes({ ok: false, error: 'Enter a valid 6-digit pincode' });
    setPinBusy(true);
    try {
      const r = await fetch(`/api/pincode?pin=${pin}`);
      setPinRes(await r.json());
    } catch {
      setPinRes({ ok: false, error: 'Could not check right now' });
    }
    setPinBusy(false);
  };

  const copy = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold leading-tight text-maroon-900 sm:text-4xl">{p.name}</h1>
      {p.ratingCount > 0 && (
        <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-stone-600">
          <Stars value={p.ratingAvg} /> {p.ratingAvg} · {p.ratingCount} review{p.ratingCount > 1 ? 's' : ''}
        </a>
      )}

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold text-maroon-900">{formatPrice(price)}</span>
        {compare > price && <span className="text-lg text-stone-400 line-through">{formatPrice(compare)}</span>}
        {off > 0 && <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">{off}% OFF</span>}
      </div>
      <p className="mt-1 text-xs text-stone-500">Inclusive of all taxes</p>

      {p.shortDescription && <p className="mt-4 text-[15px] leading-relaxed text-stone-600">{p.shortDescription}</p>}

      {hasVariants && (
        <div className="mt-6">
          <p className="label">{p.variantLabel || 'Size'}: <span className="normal-case text-stone-900">{variant?.name}</span></p>
          <div className="flex flex-wrap gap-2">
            {p.variants.map((v) => (
              <button
                key={v._id}
                disabled={v.stock < 1}
                onClick={() => { setVariantId(v._id); setQty(1); }}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${v._id === variantId ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white hover:border-maroon-800'} disabled:cursor-not-allowed disabled:text-stone-300 disabled:line-through`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {siddhOn && (
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-saffron-200 bg-saffron-50 p-3">
          <input type="checkbox" checked={siddh} onChange={(e) => setSiddh(e.target.checked)} className="mt-1 h-4 w-4 accent-saffron-600" />
          <span className="text-sm">
            <b>Get it energized (Pran Pratishta)</b> <span className="font-semibold text-saffron-800">+ {formatPrice(settings.siddhPrice)}</span>
            <span className="block text-xs text-stone-500">Prayer-energized before dispatch.</span>
          </span>
        </label>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div>
          <p className="label">Quantity</p>
          <div className="flex items-center rounded-full border border-stone-300 bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 text-xl" aria-label="Decrease">−</button>
            <span className="w-10 text-center font-medium">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))} className="h-10 w-10 text-xl" aria-label="Increase">+</button>
          </div>
        </div>
        {!soldOut && stock <= 5 && <p className="mt-5 text-sm font-medium text-red-600">Only {stock} left!</p>}
      </div>

      <div className="mt-6 grid gap-3">
        {soldOut ? (
          <button disabled className="btn btn-dark w-full py-4">Sold out</button>
        ) : (
          <>
            <button onClick={addToCart} className="btn btn-primary w-full py-4 text-base">Add to cart</button>
            <button onClick={() => buyNow(false)} className="btn btn-dark w-full py-4 text-base">Buy it now</button>
            {settings.codEnabled && (
              <button onClick={() => buyNow(true)} className="btn btn-outline w-full py-3.5">Order now — Cash on Delivery</button>
            )}
          </>
        )}
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
        <p className="label">Estimated delivery</p>
        <div className="flex gap-2">
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter pincode" inputMode="numeric" className="input" />
          <button onClick={checkPin} disabled={pinBusy} className="btn btn-dark btn-sm">{pinBusy ? '…' : 'Check'}</button>
        </div>
        {pinRes && (
          <p className={`mt-2 text-sm ${pinRes.ok ? 'text-green-700' : 'text-red-600'}`}>
            {pinRes.ok ? `Delivery by ${pinRes.from} – ${pinRes.to}${pinRes.city ? ` to ${pinRes.city}` : ''}` : pinRes.error}
          </p>
        )}
      </div>

      {/* Offers */}
      <div className="mt-4 space-y-2 text-sm">
        {settings.freeShippingMin > 0 && (
          <p className="flex items-center gap-2"><TruckIcon className="h-4 w-4 text-saffron-700" /> Free delivery on orders above {formatPrice(settings.freeShippingMin)}</p>
        )}
        {settings.prepaidDiscount > 0 && (
          <p className="flex items-center gap-2"><LockIcon className="h-4 w-4 text-saffron-700" /> Extra {formatPrice(settings.prepaidDiscount)} off on UPI / card payment</p>
        )}
        <p className="flex items-center gap-2"><ShieldIcon className="h-4 w-4 text-saffron-700" /> Genuine Rudraksha · secure packaging</p>
      </div>

      {coupons.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="label">Offers for you</p>
          {coupons.map((c) => (
            <div key={c.code} className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-saffron-400 bg-saffron-50 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-stone-900">{c.type === 'percent' ? `${c.value}% off` : `${formatPrice(c.value)} off`}{c.minOrder > 0 && ` on orders above ${formatPrice(c.minOrder)}`}</p>
                {c.description && <p className="text-xs text-stone-500">{c.description}</p>}
              </div>
              <button onClick={() => copy(c.code)} className="rounded-md bg-white px-3 py-1.5 font-mono text-xs font-bold text-maroon-800 shadow-sm">{copied === c.code ? 'Copied ✓' : c.code}</button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile sticky bar */}
      {!soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,.08)] md:hidden">
          <div className="leading-tight"><p className="text-lg font-bold text-maroon-900">{formatPrice(price)}</p>{off > 0 && <p className="text-xs text-green-700">{off}% off</p>}</div>
          <button onClick={addToCart} className="btn btn-primary ml-auto flex-1 py-3">Add to cart</button>
        </div>
      )}
    </div>
  );
}
