import Link from 'next/link';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductForm from '@/components/admin/ProductForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { PageHeader } from '@/components/admin/ui';
import { serialize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EditProduct({ params }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await dbConnect();
  const [p, categories] = await Promise.all([
    Product.findById(params.id).lean(),
    Category.find().sort({ order: 1, name: 1 }).lean(),
  ]);
  if (!p) notFound();
  return (
    <>
      <PageHeader title="Edit product" sub={p.name}>
        <Link href={`/products/${p.slug}`} target="_blank" className="btn btn-outline btn-sm">View in store ↗</Link>
        <DeleteButton url={`/api/admin/products/${p._id}`} redirect="/admin/products" label="Delete product" confirmText={`Delete “${p.name}”? This cannot be undone.`} className="rounded-full border border-red-200 px-4 py-2" />
      </PageHeader>
      <ProductForm product={serialize(p)} categories={serialize(categories)} />
    </>
  );
}
