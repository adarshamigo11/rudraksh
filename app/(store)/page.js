import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { getSettings } from '@/lib/settings';
import { serialize, imgSrc } from '@/lib/utils';
import ProductCard from '@/components/store/ProductCard';
import Stars from '@/components/store/Stars';
import { TruckIcon, ShieldIcon, RefreshIcon, LockIcon } from '@/components/store/Icons';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  const s = await getSettings();
  const [cats, best, latest, reviews] = await Promise.all([
    Category.find({ active: true }).sort({ order: 1, name: 1 }).lean(),
    Product.find({ active: true, bestseller: true }).sort({ sold: -1 }).limit(8).lean(),
    Product.find({ active: true }).sort({ createdAt: -1 }).limit(8).lean(),
    Review.find({ approved: true, rating: { $gte: 4 } }).sort({ createdAt: -1 }).limit(6).populate('product', 'name slug').lean(),
  ]);
  const featured = serialize(await Product.find({ active: true, featured: true }).limit(4).lean());
  const bestList = serialize(best.length ? best : latest.slice(0, 8));
  const latestList = serialize(latest);
  const cl = serialize(cats);
  const rv = serialize(reviews);

  const trust = [
    [ShieldIcon, 'Genuine Rudraksha', 'Handpicked, authentic beads'],
    [TruckIcon, s.freeShippingMin > 0 ? `Free delivery ₹${s.freeShippingMin}+` : 'Fast delivery', 'Shipped across India'],
    [LockIcon, 'Secure checkout', s.codEnabled ? 'Cash on Delivery · online coming soon' : 'Secure & simple checkout'],
    [RefreshIcon, 'Easy support', 'We are one message away'],
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-maroon-900 via-maroon-800 to-saffron-800 text-white">
        {s.heroImage && (
          <img src={s.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-950/80 to-transparent" />
        <div className="container-x relative grid min-h-[420px] items-center py-16 sm:min-h-[520px]">
          <div className="max-w-xl">
            <p className="mb-3 font-serif text-2xl text-amber-200">ॐ नमः शिवाय</p>
            <h1 className="font-serif text-5xl font-bold leading-[1.05] sm:text-6xl">{s.heroTitle}</h1>
            <p className="mt-4 text-lg text-amber-50/90">{s.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn bg-amber-300 px-8 text-maroon-950 hover:bg-amber-200">{s.heroCta}</Link>
              {cl[0] && <Link href={`/collections/${cl[0].slug}`} className="btn border border-white/60 px-8 text-white hover:bg-white/10">{cl[0].name}</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b bg-white">
        <div className="container-x grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {trust.map(([Icon, t, d]) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-saffron-50 text-saffron-700"><Icon className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold text-stone-900">{t}</p><p className="text-xs text-stone-500">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {cl.length > 0 && (
        <section className="container-x pt-16">
          <h2 className="section-title mb-8 text-center">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {cl.map((c) => (
              <Link key={c._id} href={`/collections/${c.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-maroon-100">
                <img src={imgSrc(c.image)} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 right-4 font-serif text-xl font-bold text-white sm:text-2xl">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="container-x pt-16">
        <h2 className="section-title mb-8 text-center">{best.length ? 'Bestsellers' : 'Our products'}</h2>
        {bestList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
            No products yet. Add your first product from <Link href="/admin" className="text-maroon-800 underline">Admin → Products</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {bestList.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        )}
        <div className="mt-8 text-center"><Link href="/shop" className="btn btn-outline">View all products</Link></div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-x pt-16">
          <h2 className="section-title mb-8 text-center">Featured</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {latestList.length > 4 && (
        <section className="container-x pt-16">
          <h2 className="section-title mb-8 text-center">New arrivals</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {latestList.slice(0, 4).map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      {rv.length > 0 && (
        <section className="mt-16 bg-saffron-50 py-16">
          <div className="container-x">
            <h2 className="section-title mb-8 text-center">What our customers say</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {rv.map((r) => (
                <figure key={r._id} className="card p-5">
                  <Stars value={r.rating} />
                  {r.title && <p className="mt-2 font-semibold text-stone-900">{r.title}</p>}
                  <blockquote className="mt-1 line-clamp-5 text-sm text-stone-600">{r.comment}</blockquote>
                  <figcaption className="mt-3 text-xs text-stone-500">
                    — {r.name}
                    {r.product && <> on <Link href={`/products/${r.product.slug}`} className="underline">{r.product.name}</Link></>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
