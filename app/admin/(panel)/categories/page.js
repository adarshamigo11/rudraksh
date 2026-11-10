import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import CategoryManager from '@/components/admin/CategoryManager';
import { PageHeader } from '@/components/admin/ui';
import { serialize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdmin() {
  await dbConnect();
  const [cats, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  const list = cats.map((c) => ({ ...c, productCount: map.get(String(c._id)) || 0 }));
  return (
    <>
      <PageHeader title="Categories" sub="Group products into collections shown in the menu and on the homepage" />
      <CategoryManager categories={serialize(list)} />
    </>
  );
}
