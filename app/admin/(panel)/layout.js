import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { isAdmin } from '@/lib/guard';
import { getSettings } from '@/lib/settings';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function PanelLayout({ children }) {
  if (!(await isAdmin())) redirect('/admin/login');
  const s = await getSettings();
  let pendingOrders = 0;
  let pendingReviews = 0;
  try {
    await dbConnect();
    [pendingOrders, pendingReviews] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Review.countDocuments({ approved: false }),
    ]);
  } catch {}

  return (
    <div className="min-h-screen bg-stone-100 lg:flex">
      <AdminNav storeName={s.storeName} pendingOrders={pendingOrders} pendingReviews={pendingReviews} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
