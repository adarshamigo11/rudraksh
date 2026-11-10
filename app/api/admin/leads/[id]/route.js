import Lead from '@/models/Lead';
import { itemHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';
export const { DELETE } = itemHandlers(Lead);
