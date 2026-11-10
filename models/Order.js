const mongoose = require('mongoose');
const { Schema } = mongoose;

const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    publicId: { type: String, unique: true, index: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        slug: String,
        image: String,
        variantId: String,
        variantName: String,
        price: Number,
        qty: Number,
        siddh: Boolean,
        _id: false,
      },
    ],
    customer: { name: String, phone: String, email: String },
    address: { line1: String, line2: String, landmark: String, city: String, state: String, pincode: String },
    subtotal: Number,
    siddhTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    prepaidDiscount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    total: Number,
    couponCode: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpay: { orderId: String, paymentId: String },
    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    tracking: { courier: { type: String, default: '' }, number: { type: String, default: '' }, url: { type: String, default: '' } },
    customerNote: { type: String, default: '' },
    adminNote: { type: String, default: '' },
    restocked: { type: Boolean, default: false },
    history: [{ status: String, note: String, at: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true }
);

OrderSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
