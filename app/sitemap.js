import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const pages = ['', '/shop', '/about', '/contact', '/track-order', '/policies/shipping-policy', '/policies/return-policy', '/policies/privacy-policy', '/policies/terms-of-service'].map((p) => ({ url: base + p, lastModified: new Date() }));
  try {
    await dbConnect();
    const [products, cats] = await Promise.all([
      Product.find({ active: true }).select('slug updatedAt').lean(),
      Category.find({ active: true }).select('slug updatedAt').lean(),
    ]);
    return [
      ...pages,
      ...cats.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: c.updatedAt })),
      ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt })),
    ];
  } catch {
    return pages;
  }
}
