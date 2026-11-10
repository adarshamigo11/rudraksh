import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import CouponManager from '@/components/admin/CouponManager';
import { PageHeader } from '@/components/admin/ui';
import { serialize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CouponsAdmin() {
  await dbConnect();
  const coupons = serialize(await Coupon.find().sort({ createdAt: -1 }).lean());
  return (
    <>
      <PageHeader title="Coupons" sub="Discount codes customers can apply at checkout" />
      <CouponManager coupons={coupons} />
    </>
  );
}
