/* Optional: fills the database with sample categories, products and coupons so you can see the store working.
 *   npm run seed            (only seeds an empty database)
 *   npm run seed -- --force (adds the samples anyway)
 * Reads MONGODB_URI from .env.local. Delete or edit the samples from the admin panel afterwards. */
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing — create .env.local first');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const force = process.argv.includes('--force');
  if (!force && (await Product.countDocuments()) > 0) {
    console.log('Database already has products — skipping (use --force to add samples anyway).');
    return;
  }

  const cats = await Category.insertMany([
    { name: 'Rudraksha Bracelets', slug: 'rudraksha-bracelets', description: 'Handcrafted bracelets with genuine Rudraksha beads.', order: 1 },
    { name: 'Rudraksha Malas', slug: 'rudraksha-malas', description: 'Traditional 108+1 bead malas for jaap and daily wear.', order: 2 },
    { name: 'Single Rudraksha', slug: 'single-rudraksha', description: 'Individual beads in different mukhi.', order: 3 },
  ]);
  const [bracelets, malas, singles] = cats.map((c) => c._id);

  const desc = `## About this product
A sample product description. Replace it with your own details from the admin panel.

## Highlights
- Genuine Rudraksha beads
- Handcrafted and carefully strung
- Comes in protective packaging

## Care instructions
- Keep away from water, perfume and harsh chemicals
- Store in a dry pouch when not in use`;

  await Product.insertMany([
    {
      name: 'Gold Plated Rudraksha Bracelet', slug: 'gold-plated-rudraksha-bracelet', category: bracelets,
      shortDescription: 'A modern 5 Mukhi Rudraksha bracelet with gold plated beads.', description: desc,
      price: 499, comparePrice: 999, variantLabel: 'Size', bestseller: true, featured: true,
      variants: [{ name: 'Small', price: 499, comparePrice: 999, stock: 20 }, { name: 'Regular', price: 499, comparePrice: 999, stock: 30 }, { name: 'Large', price: 549, comparePrice: 999, stock: 10 }],
      specs: [{ key: 'Mukhi', value: '5' }, { key: 'Bead size', value: '6–7 mm' }, { key: 'Plating', value: 'Gold' }],
      faqs: [{ q: 'Can I wear it daily?', a: 'Yes. Remove it before bathing and keep it away from perfumes.' }],
      tags: ['bracelet', '5 mukhi', 'gold'],
    },
    {
      name: 'Silver Plated Rudraksha Bracelet', slug: 'silver-plated-rudraksha-bracelet', category: bracelets,
      shortDescription: 'Elegant silver plated bracelet with 5 Mukhi beads.', description: desc,
      price: 449, comparePrice: 899, stock: 40, bestseller: true, tags: ['bracelet', 'silver'],
    },
    {
      name: 'Brown Rudraksha Mala – 108+1 Beads', slug: 'brown-rudraksha-mala-108-1', category: malas,
      shortDescription: 'Traditional mala for jaap, knotted with care.', description: desc,
      price: 599, comparePrice: 1299, stock: 25, bestseller: true, featured: true, tags: ['mala', '108'],
    },
    {
      name: '5 Mukhi Rudraksha Bead', slug: '5-mukhi-rudraksha-bead', category: singles,
      shortDescription: 'A single 5 Mukhi Rudraksha bead.', description: desc,
      price: 199, comparePrice: 349, stock: 100, tags: ['single', '5 mukhi'],
    },
  ]);

  await Coupon.insertMany([
    { code: 'NAMASTE100', description: '₹100 off on orders above ₹999', type: 'flat', value: 100, minOrder: 999, showOnProduct: true },
    { code: 'SHIVA10', description: '10% off up to ₹200', type: 'percent', value: 10, maxDiscount: 200, minOrder: 499 },
  ]).catch(() => {});

  console.log('Done — sample data added.');
}

main()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
