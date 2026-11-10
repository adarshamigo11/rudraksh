import Coupon from '@/models/Coupon';
import { collectionHandlers } from '@/lib/crud';
import { prepareCoupon } from '@/lib/prepare';

export const dynamic = 'force-dynamic';
export const { GET, POST } = collectionHandlers(Coupon, { prepare: prepareCoupon });
