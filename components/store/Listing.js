import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductCard from './ProductCard';
import { escapeRegex, serialize } from '@/lib/utils';

const PER_PAGE = 12;
const SORTS = {
  newest: { createdAt: -1 },
  popular: { sold: -1, createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
};

export default async function Listing({ title, description, category, searchParams = {}, basePath }) {
  await dbConnect();
  const sp = searchParams;
  const cats = serialize(await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean());
  const activeCat = category || cats.find((c) => c.slug === sp.category) || null;

  const filter = { active: true };
  if (activeCat) filter.category = activeCat._id;
  if (sp.q) {
    const rx = new RegExp(escapeRegex(sp.q), 'i');
    filter.$or = [{ name: rx }, { tags: rx }, { shortDescription: rx }];
  }
  const min = Number(sp.min);
  const max = Number(sp.max);
  if (min > 0 || max > 0) {
    filter.price = {};
    if (min > 0) filter.price.$gte = min;
    if (max > 0) filter.price.$lte = max;
  }
  const sort = SORTS[sp.sort] || SORTS.newest;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * PER_PAGE).limit(PER_PAGE).lean(),
    Product.countDocuments(filter),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const qs = (over) => {
    const p = new URLSearchParams();
    const merged = { q: sp.q, sort: sp.sort, min: sp.min, max: sp.max, category: category ? undefined : sp.category, page: undefined, ...over };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="section-title">{sp.q ? `Results for “${sp.q}”` : title}</h1>
        {description && <p className="mx-auto mt-2 max-w-2xl text-stone-600">{description}</p>}
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Link href="/shop" className={`rounded-full border px-4 py-1.5 text-sm ${!activeCat ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white hover:border-maroon-800'}`}>All</Link>
        {cats.map((c) => (
          <Link key={c._id} href={`/collections/${c.slug}`} className={`rounded-full border px-4 py-1.5 text-sm ${activeCat?._id === c._id ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white hover:border-maroon-800'}`}>{c.name}</Link>
        ))}
      </div>

      <form action={basePath} className="mb-8 flex flex-wrap items-end justify-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        {sp.q && <input type="hidden" name="q" value={sp.q} />}
        {!category && activeCat && <input type="hidden" name="category" value={activeCat.slug} />}
        <div>
          <label className="label">Sort by</label>
          <select name="sort" defaultValue={sp.sort || 'newest'} className="input w-44">
            <option value="newest">Newest</option>
            <option value="popular">Best selling</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <div>
          <label className="label">Min ₹</label>
          <input name="min" type="number" min="0" defaultValue={sp.min || ''} className="input w-24" />
        </div>
        <div>
          <label className="label">Max ₹</label>
          <input name="max" type="number" min="0" defaultValue={sp.max || ''} className="input w-24" />
        </div>
        <button className="btn btn-dark btn-sm">Apply</button>
        {(sp.sort || sp.min || sp.max) && <Link href={qs({ sort: undefined, min: undefined, max: undefined })} className="pb-2 text-sm text-stone-500 underline">Clear</Link>}
      </form>

      {products.length === 0 ? (
        <div className="py-20 text-center text-stone-500">
          <p className="text-lg">No products found.</p>
          <Link href="/shop" className="mt-3 inline-block text-maroon-800 underline">Browse all products</Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-stone-500">{total} product{total === 1 ? '' : 's'}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p._id} p={serialize(p)} />)}
          </div>
        </>
      )}

      {pages > 1 && (
        <nav className="mt-12 flex flex-wrap justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={qs({ page: n > 1 ? String(n) : undefined })} className={`grid h-10 w-10 place-items-center rounded-full border text-sm ${n === page ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white hover:border-maroon-800'}`}>{n}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
