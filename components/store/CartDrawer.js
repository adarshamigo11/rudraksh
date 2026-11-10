'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
import CartLines from './CartLines';
import { CloseIcon } from './Icons';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { open, setOpen, items, subtotal, siddhTotal, freeLeft, settings } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const close = () => setOpen(false);
  const pct = settings.freeShippingMin > 0 ? Math.min(100, (subtotal / settings.freeShippingMin) * 100) : 100;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 fade-in" onClick={close} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-serif text-2xl font-bold text-maroon-900">Your cart</h2>
          <button onClick={close} aria-label="Close cart"><CloseIcon /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-stone-500">Your cart is empty</p>
            <Link href="/shop" onClick={close} className="btn btn-primary">Start shopping</Link>
          </div>
        ) : (
          <>
            {settings.freeShippingMin > 0 && (
              <div className="border-b bg-saffron-50 px-5 py-3 text-xs">
                {freeLeft > 0 ? (
                  <p>Add <b>{formatPrice(freeLeft)}</b> more for <b>free delivery</b></p>
                ) : (
                  <p className="font-semibold text-green-700">🎉 You've unlocked free delivery!</p>
                )}
                <div className="mt-2 h-1.5 rounded-full bg-saffron-100">
                  <div className="h-full rounded-full bg-saffron-600 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5"><CartLines onNavigate={close} /></div>
            <div className="space-y-3 border-t p-5">
              <div className="flex justify-between text-sm"><span>Subtotal</span><b>{formatPrice(subtotal + siddhTotal)}</b></div>
              <p className="text-xs text-stone-500">Shipping and discounts are calculated at checkout.</p>
              <Link href="/checkout" onClick={close} className="btn btn-primary w-full">Checkout</Link>
              <Link href="/cart" onClick={close} className="block text-center text-sm text-maroon-800 underline">View full cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
