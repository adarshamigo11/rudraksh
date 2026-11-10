import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Review from '@/models/Review';
import Coupon from '@/models/Coupon';
import { getSettings } from '@/lib/settings';
import { serialize, renderDescription, totalStock } from '@/lib/utils';
import ProductGallery from '@/components/store/ProductGallery';
import ProductInfo from '@/components/store/ProductInfo';
import ReviewSection from '@/components/store/ReviewSection';
import ProductCard from '@/components/store/ProductCard';

export const dynamic = 'force-dynamic';

const getProduct = cache(async (slug) => {
  await dbConnect();
  const p = await Product.findOne({ slug, active: true }).lean();
  return p ? serialize(p) : null;
});

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  if (!p) return {};
  const desc = p.seoDescription || p.shortDescription || p.description.replace(/[#*!\[\]()-]/g, '').slice(0, 155);
  return {
    title: p.seoTitle || p.name,
    description: desc,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.seoTitle || p.name, description: desc, images: p.images?.[0] ? [p.images[0]] : [], type: 'website' },
  };
}

export default async function ProductPage({ params }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();

  const [category, reviews, coupons, related, settings] = await Promise.all([
    p.category ? Category.findById(p.category).lean() : null,
    Review.find({ product: p._id, approved: true }).sort({ createdAt: -1 }).limit(30).lean(),
    Coupon.find({
      active: true,
      showOnProduct: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).limit(3).lean(),
    Product.find({ active: true, _id: { $ne: p._id }, ...(p.category ? { category: p.category } : {}) }).sort({ sold: -1 }).limit(4).lean(),
    getSettings(),
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images?.map((i) => (i.startsWith('http') ? i : site + i)),
    description: p.shortDescription || p.description.slice(0, 200),
    sku: p.sku || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: p.price,
      availability: totalStock(p) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${site}/products/${p.slug}`,
    },
    ...(p.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.ratingAvg, reviewCount: p.ratingCount } } : {}),
  };

  return (
    <div className="container-x py-6 pb-28 sm:py-10 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-5 text-xs text-stone-500">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        {category && <><Link href={`/collections/${category.slug}`} className="hover:underline">{category.name}</Link> / </>}
        <span className="text-stone-800">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={p.images} name={p.name} />
        <ProductInfo product={{ ...p, description: undefined }} coupons={serialize(coupons)} />
      </div>

      <div className="mx-auto mt-14 max-w-3xl space-y-12">
        {p.description && (
          <section>
            <h2 className="mb-4 font-serif text-3xl font-bold text-maroon-900">Description</h2>
            <div className="desc" dangerouslySetInnerHTML={{ __html: renderDescription(p.description) }} />
          </section>
        )}

        {p.specs?.length > 0 && (
          <section>
            <h2 className="mb-4 font-serif text-3xl font-bold text-maroon-900">Details</h2>
            <dl className="card divide-y divide-stone-200 overflow-hidden text-sm">
              {p.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 px-4 py-3 odd:bg-stone-50">
                  <dt className="font-medium text-stone-600">{s.key}</dt>
                  <dd className="col-span-2 text-stone-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section>
          <h2 className="mb-4 font-serif text-3xl font-bold text-maroon-900">Shipping & returns</h2>
          <div className="card space-y-2 p-5 text-sm text-stone-600">
            <p>📦 Delivery in {settings.deliveryMinDays}–{settings.deliveryMaxDays} days across India.</p>
            {settings.freeShippingMin > 0 && <p>🚚 Free shipping above ₹{settings.freeShippingMin}.</p>}
            {settings.returnDays > 0 && <p>↩️ Report damaged or wrong items within {settings.returnDays} days of delivery.</p>}
            {settings.replacementMonths > 0 && <p>🛡️ {settings.replacementMonths} months free replacement.</p>}
            <p><Link href="/policies/return-policy" className="text-maroon-800 underline">Read the full policy</Link></p>
          </div>
        </section>

        {p.faqs?.length > 0 && (
          <section>
            <h2 className="mb-4 font-serif text-3xl font-bold text-maroon-900">Frequently asked questions</h2>
            <div className="space-y-2">
              {p.faqs.map((f, i) => (
                <details key={i} className="card group p-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-stone-900">
                    {f.q}<span className="text-xl text-saffron-700 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-sm text-stone-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <ReviewSection productId={p._id} reviews={serialize(reviews)} avg={p.ratingAvg} count={p.ratingCount} />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-8 text-center">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {serialize(related).map((r) => <ProductCard key={r._id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
