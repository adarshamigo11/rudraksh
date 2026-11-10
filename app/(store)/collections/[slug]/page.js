import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Listing from '@/components/store/Listing';
import { serialize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getCategory(slug) {
  await dbConnect();
  const c = await Category.findOne({ slug, active: true }).lean();
  return c ? serialize(c) : null;
}

export async function generateMetadata({ params }) {
  const c = await getCategory(params.slug);
  return c ? { title: c.name, description: c.description || undefined } : {};
}

export default async function CollectionPage({ params, searchParams }) {
  const category = await getCategory(params.slug);
  if (!category) notFound();
  return (
    <Listing
      title={category.name}
      description={category.description}
      category={category}
      searchParams={searchParams}
      basePath={`/collections/${category.slug}`}
    />
  );
}
