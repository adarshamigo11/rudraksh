import { Suspense } from 'react';
import CheckoutClient from '@/components/store/CheckoutClient';
import { razorpayConfigured } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-stone-400">Loading…</div>}>
      <CheckoutClient razorpayEnabled={razorpayConfigured()} />
    </Suspense>
  );
}
