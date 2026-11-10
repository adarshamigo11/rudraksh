const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariantSchema = new Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 },
  sku: String,
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
    variantLabel: { type: String, default: 'Size' },
    variants: { type: [VariantSchema], default: [] },
    siddhAvailable: { type: Boolean, default: true },
    specs: [{ key: String, value: String, _id: false }],
    faqs: [{ q: String, a: String, _id: false }],
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
