import Product from '@/models/Product';
import { itemHandlers } from '@/lib/crud';
import { prepareProduct } from '@/lib/prepare';

export const dynamic = 'force-dynamic';
export const { GET, PUT, DELETE } = itemHandlers(Product, { prepare: prepareProduct });
