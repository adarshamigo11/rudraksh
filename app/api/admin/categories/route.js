import Category from '@/models/Category';
import { collectionHandlers } from '@/lib/crud';
import { prepareCategory } from '@/lib/prepare';

export const dynamic = 'force-dynamic';
export const { GET, POST } = collectionHandlers(Category, { sort: { order: 1, name: 1 }, prepare: prepareCategory });
