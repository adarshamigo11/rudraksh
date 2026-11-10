import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import DeleteButton from '@/components/admin/DeleteButton';
import { Badge, PageHeader } from '@/components/admin/ui';
import { escapeRegex, formatPrice, imgSrc, totalStock } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProductsAdmin({ searchParams }) {
  await dbConnect();
  const q = (searchParams.q || '').trim();
  const filter = q ? { name: new RegExp(escapeRegex(q), 'i') } : {};
  const products = await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 }).limit(300).lean();

  return (
    <>
      <PageHeader title="Products" sub={`${products.length} product${products.length === 1 ? '' : 's'}`}>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ Add product</Link>
      </PageHeader>

      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search products…" className="input max-w-xs" />
        <button className="btn btn-dark btn-sm">Search</button>
      </form>

      <div className="a-card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr><th className="a-th">Product</th><th className="a-th">Category</th><th className="a-th">Price</th><th className="a-th">Stock</th><th className="a-th">Status</th><th className="a-th" /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => {
              const stock = totalStock(p);
              return (
                <tr key={p._id} className="hover:bg-stone-50">
                  <td className="a-td">
                    <Link href={`/admin/products/${p._id}`} className="flex items-center gap-3">
                      <img src={imgSrc(p.images?.[0])} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span className="font-medium text-stone-900">{p.name}{p.variants?.length > 0 && <span className="ml-2 text-xs text-stone-400">{p.variants.length} variants</span>}</span>
                    </Link>
                  </td>
                  <td className="a-td text-stone-600">{p.category?.name || '—'}</td>
                  <td className="a-td">{p.variants?.length ? 'From ' : ''}{formatPrice(p.price)}{p.comparePrice > p.price && <span className="ml-1 text-xs text-stone-400 line-through">{formatPrice(p.comparePrice)}</span>}</td>
                  <td className={`a-td ${stock === 0 ? 'font-semibold text-red-600' : stock <= 5 ? 'font-semibold text-amber-600' : ''}`}>{stock === 0 ? 'Out of stock' : stock}</td>
                  <td className="a-td"><Badge value={p.active ? 'active' : 'draft'}>{p.active ? 'Active' : 'Hidden'}</Badge></td>
                  <td className="a-td whitespace-nowrap text-right">
                    <Link href={`/admin/products/${p._id}`} className="mr-4 text-sm font-medium text-maroon-800 hover:underline">Edit</Link>
                    <DeleteButton url={`/api/admin/products/${p._id}`} confirmText={`Delete “${p.name}”?`} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-500">No products yet. <Link href="/admin/products/new" className="text-maroon-800 underline">Add your first product</Link></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
