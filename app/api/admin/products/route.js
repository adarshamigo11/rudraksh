import Product from '@/models/Product';
import { collectionHandlers } from '@/lib/crud';
import { prepareProduct } from '@/lib/prepare';

export const dynamic = 'force-dynamic';
export const { GET, POST } = collectionHandlers(Product, { prepare: prepareProduct });
