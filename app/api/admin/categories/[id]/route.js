import Category from '@/models/Category';
import Product from '@/models/Product';
import { itemHandlers } from '@/lib/crud';
import { prepareCategory } from '@/lib/prepare';

export const dynamic = 'force-dynamic';
export const { GET, PUT, DELETE } = itemHandlers(Category, {
  prepare: prepareCategory,
  // Products in a deleted category stay, they just become uncategorised
  after: async (doc, action) => {
    if (action === 'delete') await Product.updateMany({ category: doc._id }, { $set: { category: null } });
  },
});
