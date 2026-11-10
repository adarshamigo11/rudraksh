'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from './CartProvider';
import { formatPrice, imgSrc } from '@/lib/utils';
import { STATES } from '@/lib/states';

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load payment window'));
    document.body.appendChild(s);
  });
}

export default function CheckoutClient({ razorpayEnabled }) {
  const { items, ready, clear, settings } = useCart();
  const router = useRouter();
  const sp = useSearchParams();

  const codOk = settings.codEnabled;
  const [pay, setPay] = useState(() => (sp.get('pay') === 'cod' && codOk ? 'cod' : razorpayEnabled ? 'online' : 'cod'));
  const [form, setForm] = useState({ name: '', phone: '', email: '', line1: '', line2: '', landmark: '', pincode: '', city: '', state: '', note: '' });
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState({ ok: false, text: '' });
  const [quote, setQuote] = useState(null);
  const [quoteErr, setQuoteErr] = useState('');
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const payload = useMemo(() => items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, siddh: i.siddh })), [items]);

  // Re-price on the server whenever the cart, coupon or payment method changes
  useEffect(() => {
    if (!ready || !items.length) return;
    const ac = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payload, couponCode: coupon, paymentMethod: pay }),
          signal: ac.signal,
        });
        const d = await r.json();
        if (!r.ok) {
          setQuote(null);
          setQuoteErr(d.error || 'Could not calculate your total');
          return;
        }
        setQuote(d);
        setQuoteErr('');
        if (coupon) {
          if (d.couponError) {
            setCouponMsg({ ok: false, text: d.couponError });
            setCoupon('');
          } else setCouponMsg({ ok: true, text: `Coupon ${d.couponCode} applied — you saved ${formatPrice(d.discount)}` });
        }
      } catch (e) {
        if (e.name !== 'AbortError') setQuoteErr('Network error — please check your connection');
      }
    }, 200);
    return () => { clearTimeout(t); ac.abort(); };
  }, [payload, coupon, pay, ready, items.length]);

  // Auto-fill city/state from pincode
  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(form.pincode)) return;
    let stop = false;
    fetch(`/api/pincode?pin=${form.pincode}`)
      .then((r) => r.json())
      .then((d) => { if (!stop && d.ok && d.city) setForm((f) => ({ ...f, city: f.city || d.city, state: f.state || d.state })); })
      .catch(() => {});
    return () => { stop = true; };
  }, [form.pincode]);

  const applyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponMsg({ ok: false, text: '' });
    setCoupon(couponInput.trim().toUpperCase());
  };

  const place = async (e) => {
    e.preventDefault();
    setErr('');
    setPlacing(true);
    try {
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload,
          couponCode: coupon,
          paymentMethod: pay,
          note: form.note,
          customer: { name: form.name, phone: form.phone, email: form.email },
          address: { line1: form.line1, line2: form.line2, landmark: form.landmark, city: form.city, state: form.state, pincode: form.pincode },
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not place order');

      if (d.razorpay) {
        await loadRazorpay();
        const rz = new window.Razorpay({
          key: d.razorpay.key,
          amount: d.razorpay.amount,
          currency: 'INR',
          order_id: d.razorpay.orderId,
          name: settings.storeName,
          description: `Order ${d.orderNumber}`,
          prefill: { name: form.name, contact: form.phone, email: form.email },
          theme: { color: '#7a2420' },
          handler: async (resp) => {
            try {
              const v = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...resp, publicId: d.publicId }),
              });
              if (!v.ok) throw new Error();
            } catch {
              /* payment may still be captured — the success page shows its real status */
            }
            clear();
            router.push(`/order-success/${d.publicId}`);
          },
          modal: {
            ondismiss: () => {
              setPlacing(false);
              setErr(`Payment was not completed. Your order ${d.orderNumber} is saved as unpaid — please contact us to complete it, or place a new order.`);
              clear();
            },
          },
        });
        rz.open();
        return;
      }

      clear();
      router.push(`/order-success/${d.publicId}`);
    } catch (e2) {
      setErr(e2.message);
      setPlacing(false);
    }
  };

  if (!ready) return <div className="container-x py-24 text-center text-stone-400">Loading…</div>;
  if (!items.length) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="section-title">Your cart is empty</h1>
        <Link href="/shop" className="btn btn-primary mt-6">Continue shopping</Link>
        {err && <p className="mx-auto mt-6 max-w-md rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{err}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={place} className="container-x py-10">
      <h1 className="section-title mb-8">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="card space-y-4 p-5">
            <h2 className="font-serif text-2xl font-bold text-maroon-900">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full name *</label><input required value={form.name} onChange={set('name')} autoComplete="name" className="input" /></div>
              <div><label className="label">Mobile number *</label><input required value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="10-digit number" className="input" /></div>
            </div>
            <div><label className="label">Email (optional)</label><input type="email" value={form.email} onChange={set('email')} autoComplete="email" className="input" /></div>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-serif text-2xl font-bold text-maroon-900">Delivery address</h2>
            <div><label className="label">Address line 1 *</label><input required value={form.line1} onChange={set('line1')} autoComplete="address-line1" placeholder="House no., building, street" className="input" /></div>
            <div><label className="label">Address line 2</label><input value={form.line2} onChange={set('line2')} autoComplete="address-line2" className="input" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Landmark</label><input value={form.landmark} onChange={set('landmark')} className="input" /></div>
              <div><label className="label">Pincode *</label><input required value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} inputMode="numeric" autoComplete="postal-code" className="input" /></div>
              <div><label className="label">City *</label><input required value={form.city} onChange={set('city')} autoComplete="address-level2" className="input" /></div>
              <div>
                <label className="label">State *</label>
                <select required value={form.state} onChange={set('state')} className="input">
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Order note (optional)</label><textarea rows={2} value={form.note} onChange={set('note')} className="input" /></div>
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="font-serif text-2xl font-bold text-maroon-900">Payment</h2>
            {razorpayEnabled && (
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${pay === 'online' ? 'border-maroon-800 bg-maroon-50' : 'border-stone-200'}`}>
                <input type="radio" name="pay" checked={pay === 'online'} onChange={() => setPay('online')} className="mt-1 accent-maroon-800" />
                <span className="text-sm">
                  <b>Pay online — UPI, cards, netbanking</b>
                  {settings.prepaidDiscount > 0 && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Save {formatPrice(settings.prepaidDiscount)}</span>}
                  <span className="block text-xs text-stone-500">Secure payment via Razorpay.</span>
                </span>
              </label>
            )}
            {!razorpayEnabled && (
              <div className="cursor-not-allowed rounded-lg border border-stone-200 bg-stone-50 p-4 opacity-70">
                <div className="flex items-start gap-3">
                  <input type="radio" name="pay-coming-soon" disabled className="mt-1" />
                  <span className="text-sm">
                    <b className="text-stone-500">Pay online — UPI, cards, netbanking</b>
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Coming soon</span>
                    <span className="block text-xs text-stone-500">Not available yet — please use Cash on Delivery.</span>
                  </span>
                </div>
              </div>
            )}
            {codOk && (
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${pay === 'cod' ? 'border-maroon-800 bg-maroon-50' : 'border-stone-200'}`}>
                <input type="radio" name="pay" checked={pay === 'cod'} onChange={() => setPay('cod')} className="mt-1 accent-maroon-800" />
                <span className="text-sm">
                  <b>Cash on Delivery</b>
                  {settings.codFee > 0 && <span className="ml-2 text-xs text-stone-500">(+{formatPrice(settings.codFee)} handling)</span>}
                  <span className="block text-xs text-stone-500">Pay in cash when your order arrives.</span>
                </span>
              </label>
            )}
            {!codOk && !razorpayEnabled && <p className="text-sm text-red-600">No payment method is enabled. Please contact the store.</p>}
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-2">
          <div className="card space-y-4 p-5 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl font-bold text-maroon-900">Order summary</h2>
            <ul className="max-h-64 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <img src={imgSrc(i.image)} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-stone-800 px-1 text-[11px] text-white">{i.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm"><p className="line-clamp-1 font-medium">{i.name}</p>{i.variantName && <p className="text-xs text-stone-500">{i.variantName}</p>}</div>
                  <span className="text-sm">{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>

            <div>
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="input uppercase" />
                <button onClick={applyCoupon} className="btn btn-dark btn-sm" type="button" onMouseDown={(e) => e.preventDefault()}>Apply</button>
              </div>
              {couponMsg.text && <p className={`mt-1.5 text-xs ${couponMsg.ok ? 'text-green-700' : 'text-red-600'}`}>{couponMsg.text}</p>}
            </div>

            {quoteErr && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{quoteErr}</p>}
            {quote && (
              <dl className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(quote.subtotal)}</dd></div>
                {quote.siddhTotal > 0 && <div className="flex justify-between"><dt>Energization</dt><dd>{formatPrice(quote.siddhTotal)}</dd></div>}
                {quote.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon ({quote.couponCode})</dt><dd>−{formatPrice(quote.discount)}</dd></div>}
                {quote.prepaidDiscount > 0 && <div className="flex justify-between text-green-700"><dt>Online payment discount</dt><dd>−{formatPrice(quote.prepaidDiscount)}</dd></div>}
                <div className="flex justify-between"><dt>Shipping</dt><dd>{quote.shipping === 0 ? <span className="text-green-700">FREE</span> : formatPrice(quote.shipping)}</dd></div>
                {quote.codFee > 0 && <div className="flex justify-between"><dt>COD handling</dt><dd>{formatPrice(quote.codFee)}</dd></div>}
                <div className="flex justify-between border-t pt-3 text-lg font-bold text-maroon-900"><dt>Total</dt><dd>{formatPrice(quote.total)}</dd></div>
              </dl>
            )}

            {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
            <button disabled={placing || !quote || (!codOk && !razorpayEnabled)} className="btn btn-primary w-full py-4 text-base">
              {placing ? 'Placing order…' : pay === 'online' ? `Pay ${quote ? formatPrice(quote.total) : ''}` : 'Place order'}
            </button>
            <p className="text-center text-xs text-stone-500">By placing your order you agree to our <Link href="/policies/terms-of-service" className="underline">terms</Link>.</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
