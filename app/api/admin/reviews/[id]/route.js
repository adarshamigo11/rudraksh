import Review from '@/models/Review';
import Product from '@/models/Product';
import { itemHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// Keep each product's average rating in sync whenever a review is approved/edited/deleted
async function recalc(doc) {
  const [agg] = await Review.aggregate([
    { $match: { product: doc.product, approved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: doc.product },
    { $set: { ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0, ratingCount: agg ? agg.count : 0 } }
  );
}

export const { GET, PUT, DELETE } = itemHandlers(Review, { after: recalc });
