import Product from '@/models/Product';
import Category from '@/models/Category';
import { slugify } from './utils';
import { httpError } from './api';

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

async function uniqueSlug(Model, base, id) {
  let slug = slugify(base) || 'item';
  const clash = await Model.findOne({ slug, ...(id ? { _id: { $ne: id } } : {}) }).select('_id').lean();
  if (clash) slug += '-' + Math.random().toString(36).slice(2, 6);
  return slug;
}

export async function prepareProduct(body, id) {
  const b = { ...body };
  b.name = String(b.name || '').trim();
  if (!b.name) throw httpError(400, 'Product name is required');
  b.slug = await uniqueSlug(Product, b.slug || b.name, id);
  b.images = (b.images || []).filter(Boolean);
  b.category = b.category || null;
  b.tags = (Array.isArray(b.tags) ? b.tags : String(b.tags || '').split(','))
    .map((t) => String(t).trim())
    .filter(Boolean);
  b.price = num(b.price);
  b.comparePrice = num(b.comparePrice);
  b.stock = Math.max(0, Math.floor(num(b.stock)));

  b.variants = (b.variants || [])
    .filter((v) => v && String(v.name || '').trim())
    .map((v) => ({
      ...(v._id ? { _id: v._id } : {}),
      name: String(v.name).trim(),
      price: num(v.price),
      comparePrice: num(v.comparePrice),
      stock: Math.max(0, Math.floor(num(v.stock))),
      sku: v.sku || '',
    }));
  if (b.variants.length) {
    // The product-level price is the lowest variant price (shown as "From ₹…")
    const cheapest = b.variants.reduce((a, v) => (v.price < a.price ? v : a), b.variants[0]);
    b.price = cheapest.price;
    b.comparePrice = cheapest.comparePrice;
    b.stock = 0;
  }
  b.specs = (b.specs || []).filter((s) => s?.key?.trim() && s?.value?.trim());
  b.faqs = (b.faqs || []).filter((f) => f?.q?.trim() && f?.a?.trim());
  delete b.ratingAvg;
  delete b.ratingCount;
  delete b.sold;
  return b;
}

export async function prepareCategory(body, id) {
  const b = { ...body };
  b.name = String(b.name || '').trim();
  if (!b.name) throw httpError(400, 'Category name is required');
  b.slug = await uniqueSlug(Category, b.slug || b.name, id);
  b.order = num(b.order);
  return b;
}

export async function prepareCoupon(body) {
  const b = { ...body };
  b.code = String(b.code || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!b.code) throw httpError(400, 'Coupon code is required');
  b.value = num(b.value);
  b.minOrder = num(b.minOrder);
  b.maxDiscount = num(b.maxDiscount);
  b.usageLimit = num(b.usageLimit);
  b.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;
  if (b.type === 'percent' && (b.value <= 0 || b.value > 100)) throw httpError(400, 'Percent must be between 1 and 100');
  delete b.used;
  return b;
}
