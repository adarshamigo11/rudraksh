const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, default: '' },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
