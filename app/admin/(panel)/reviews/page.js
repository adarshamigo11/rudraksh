import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import ReviewActions from '@/components/admin/ReviewActions';
import Stars from '@/components/store/Stars';
import { Badge, PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function ReviewsAdmin({ searchParams }) {
  await dbConnect();
  const tab = searchParams.tab === 'approved' ? 'approved' : 'pending';
  const [reviews, pendingCount] = await Promise.all([
    Review.find({ approved: tab === 'approved' }).populate('product', 'name slug').sort({ createdAt: -1 }).limit(200).lean(),
    Review.countDocuments({ approved: false }),
  ]);

  return (
    <>
      <PageHeader title="Reviews" sub="Customer reviews appear in the store only after you approve them" />
      <div className="mb-4 flex gap-2">
        <Link href="/admin/reviews" className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tab === 'pending' ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white'}`}>Pending ({pendingCount})</Link>
        <Link href="/admin/reviews?tab=approved" className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tab === 'approved' ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-stone-300 bg-white'}`}>Approved</Link>
      </div>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="a-card">
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={r.rating} />
              <span className="font-semibold">{r.name}</span>
              <Badge value={r.approved ? 'active' : 'pending'}>{r.approved ? 'Approved' : 'Pending'}</Badge>
              <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              <div className="ml-auto"><ReviewActions id={String(r._id)} approved={r.approved} /></div>
            </div>
            {r.product && <p className="mt-1 text-xs text-stone-500">on <Link href={`/products/${r.product.slug}`} target="_blank" className="underline">{r.product.name}</Link></p>}
            {r.title && <p className="mt-2 font-medium">{r.title}</p>}
            <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="a-card text-center text-sm text-stone-500">{tab === 'pending' ? 'No reviews waiting for approval.' : 'No approved reviews yet.'}</p>}
      </div>
    </>
  );
}
