import Listing from '@/components/store/Listing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shop all Rudraksha' };

export default function ShopPage({ searchParams }) {
  return <Listing title="All Products" searchParams={searchParams} basePath="/shop" />;
}
