import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import ProductForm from '@/components/admin/ProductForm';
import { PageHeader } from '@/components/admin/ui';
import { serialize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NewProduct() {
  await dbConnect();
  const categories = serialize(await Category.find().sort({ order: 1, name: 1 }).lean());
  return (
    <>
      <PageHeader title="Add product" />
      <ProductForm categories={categories} />
    </>
  );
}
