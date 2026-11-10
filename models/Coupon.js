const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'flat'], default: 'flat' },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    showOnProduct: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
