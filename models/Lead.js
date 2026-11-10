const mongoose = require('mongoose');

// Newsletter sign-ups and contact-form messages
const LeadSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['newsletter', 'contact'], required: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
