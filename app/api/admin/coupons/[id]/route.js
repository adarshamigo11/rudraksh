import Coupon from '@/models/Coupon';
import { itemHandlers } from '@/lib/crud';
import { prepareCoupon } from '@/lib/prepare';

export const dynamic = 'force-dynamic';
export const { GET, PUT, DELETE } = itemHandlers(Coupon, { prepare: prepareCoupon });
