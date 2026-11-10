import dbConnect from './mongodb';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getSettings } from './settings';
import { httpError } from './api';

const int = (v, d = 1) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export async function evaluateCoupon(code, subtotal) {
  const c = await Coupon.findOne({ code: String(code).trim().toUpperCase(), active: true }).lean();
  if (!c) throw httpError(400, 'Invalid coupon code');
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) throw httpError(400, 'This coupon has expired');
  if (c.usageLimit && c.used >= c.usageLimit) throw httpError(400, 'This coupon has reached its usage limit');
  if (c.minOrder && subtotal < c.minOrder) throw httpError(400, `Minimum order of ₹${c.minOrder} required for this coupon`);
  let discount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.type === 'percent' && c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  return { coupon: c, discount: Math.min(discount, subtotal) };
}

// Server-side source of truth for every price. Never trust prices sent by the browser.
export async function priceOrder({ items, couponCode, paymentMethod }) {
  await dbConnect();
  const settings = await getSettings();
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty');
  if (items.length > 30) throw httpError(400, 'Too many items in cart');

  const ids = [...new Set(items.map((i) => String(i.productId)))];
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const map = new Map(products.map((p) => [String(p._id), p]));

  const lines = [];
  for (const it of items) {
    const p = map.get(String(it.productId));
    if (!p) throw httpError(400, 'An item in your cart is no longer available. Please remove it.');
    const qty = Math.min(Math.max(int(it.qty), 1), 10);
    let variant = null;
    if (p.variants?.length) {
      variant = p.variants.find((v) => String(v._id) === String(it.variantId));
      if (!variant) throw httpError(400, `Please choose a ${p.variantLabel || 'size'} for ${p.name}`);
    }
    const unit = variant ? variant.price : p.price;
    const stock = variant ? variant.stock : p.stock;
    const label = `${p.name}${variant ? ` (${variant.name})` : ''}`;
    if (stock < qty) throw httpError(400, stock > 0 ? `Only ${stock} left of ${label}` : `${label} is out of stock`);
    lines.push({
      product: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] || '',
      variantId: variant ? String(variant._id) : '',
      variantName: variant ? variant.name : '',
      price: unit,
      qty,
      siddh: !!(it.siddh && p.siddhAvailable && settings.siddhPrice > 0),
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const siddhTotal = lines.reduce((s, l) => s + (l.siddh ? settings.siddhPrice * l.qty : 0), 0);

  let discount = 0;
  let coupon = null;
  let couponError = '';
  if (couponCode) {
    try {
      const r = await evaluateCoupon(couponCode, subtotal);
      coupon = r.coupon;
      discount = r.discount;
    } catch (e) {
      if (!e.status) throw e;
      couponError = e.message;
    }
  }

  const method = paymentMethod === 'online' ? 'online' : 'cod';
  const prepaidDiscount = method === 'online' ? Math.min(settings.prepaidDiscount || 0, subtotal - discount) : 0;
  const afterDiscount = subtotal - discount - prepaidDiscount;
  const shipping = afterDiscount + discount + prepaidDiscount >= settings.freeShippingMin && settings.freeShippingMin > 0 ? 0 : settings.shippingFee;
  const codFee = method === 'cod' ? settings.codFee : 0;
  const total = Math.max(0, subtotal + siddhTotal - discount - prepaidDiscount + shipping + codFee);

  return {
    lines,
    coupon,
    couponCode: coupon ? coupon.code : '',
    couponError,
    subtotal,
    siddhTotal,
    discount,
    prepaidDiscount,
    shipping,
    codFee,
    total,
    freeShippingMin: settings.freeShippingMin,
  };
}

export async function restoreStock(lines) {
  for (const l of lines) {
    if (l.variantId) {
      await Product.updateOne(
        { _id: l.product, 'variants._id': l.variantId },
        { $inc: { 'variants.$.stock': l.qty, sold: -l.qty } }
      );
    } else {
      await Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty, sold: -l.qty } });
    }
  }
}

// Atomically take stock. If any line fails, everything already taken is put back.
export async function reserveStock(lines) {
  const done = [];
  try {
    for (const l of lines) {
      const res = l.variantId
        ? await Product.updateOne(
            { _id: l.product, variants: { $elemMatch: { _id: l.variantId, stock: { $gte: l.qty } } } },
            { $inc: { 'variants.$.stock': -l.qty, sold: l.qty } }
          )
        : await Product.updateOne(
            { _id: l.product, stock: { $gte: l.qty } },
            { $inc: { stock: -l.qty, sold: l.qty } }
          );
      if (!res.modifiedCount) throw httpError(409, `${l.name} just went out of stock. Please update your cart.`);
      done.push(l);
    }
  } catch (e) {
    await restoreStock(done);
    throw e;
  }
}
