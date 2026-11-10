const mongoose = require('mongoose');

// Product images are stored in MongoDB so the site works on any host (Vercel, VPS, ...)
// without extra storage services. Served from /api/images/:id with long cache headers.
const ImageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    name: String,
    size: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Image || mongoose.model('Image', ImageSchema);
