'use client';
import Link from 'next/link';
import { useCart } from '@/components/store/CartProvider';
import CartLines from '@/components/store/CartLines';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, ready, subtotal, siddhTotal, freeLeft, settings } = useCart();

  if (!ready) return <div className="container-x py-24 text-center text-stone-400">Loading…</div>;
  if (!items.length) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="section-title">Your cart is empty</h1>
        <p className="mt-2 text-stone-500">Looks like you have not added anything yet.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="section-title mb-8">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2"><CartLines /></div>
        <aside className="card h-fit space-y-3 p-5">
          <h2 className="font-serif text-2xl font-bold text-maroon-900">Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {siddhTotal > 0 && <div className="flex justify-between text-sm"><span>Energization</span><span>{formatPrice(siddhTotal)}</span></div>}
          {settings.freeShippingMin > 0 && (
            <p className={`rounded-lg px-3 py-2 text-xs ${freeLeft > 0 ? 'bg-saffron-50 text-saffron-800' : 'bg-green-50 text-green-700'}`}>
              {freeLeft > 0 ? `Add ${formatPrice(freeLeft)} more for free delivery` : 'You get free delivery 🎉'}
            </p>
          )}
          <p className="text-xs text-stone-500">Shipping, coupons and payment offers are applied at checkout.</p>
          <Link href="/checkout" className="btn btn-primary w-full">Proceed to checkout</Link>
          <Link href="/shop" className="block text-center text-sm text-maroon-800 underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
