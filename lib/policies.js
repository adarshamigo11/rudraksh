// Starter policy text. Review and adapt to your business — these are templates, not legal advice.
export function getPolicy(slug, s) {
  const contact = [s.email, s.phone].filter(Boolean).join(' or ') || 'the contact details on this website';
  const P = {
    'shipping-policy': {
      title: 'Shipping policy',
      body: `## Delivery time
Orders are dispatched shortly after confirmation and usually reach you within ${s.deliveryMinDays}–${s.deliveryMaxDays} days across India.

## Shipping charges
${s.freeShippingMin > 0 ? `Delivery is free on orders of ₹${s.freeShippingMin} and above. For smaller orders a shipping fee of ₹${s.shippingFee} applies.` : `A shipping fee of ₹${s.shippingFee} applies to every order.`}

## Cash on Delivery
${s.codEnabled ? `Cash on Delivery is available with a handling fee of ₹${s.codFee}. Please keep the exact amount ready and accept the parcel when our courier partner arrives.` : 'Cash on Delivery is currently not available.'}

## Tracking
You will be able to track your order on the Track Order page using your order number and mobile number.

## Delays
Weather, festivals and courier issues can occasionally delay a delivery. Please contact us at ${contact} if your order is late.`,
    },
    'return-policy': {
      title: 'Return & replacement policy',
      body: `## Damaged or wrong items
${s.returnDays > 0 ? `If your item arrives damaged, defective or different from what you ordered, contact us within ${s.returnDays} day(s) of delivery with photos and an unboxing video. After checking, we will arrange a replacement or refund.` : 'Please contact us immediately if your item arrives damaged or incorrect.'}

${s.replacementMonths > 0 ? `## Free replacement\nWe offer a free replacement for ${s.replacementMonths} months on eligible products. Terms apply — contact us to know more.\n` : ''}
## Not eligible
- Items damaged by the customer or used after delivery
- Items not returned in original packaging
- Orders where the delivery was refused without a valid reason

## Natural variation
Rudraksha is a natural product and each bead is unique. Small differences in colour, size and texture are normal and are not a defect.

## How to start
Write to us at ${contact} with your order number and photos.`,
    },
    'privacy-policy': {
      title: 'Privacy policy',
      body: `## What we collect
When you place an order or contact us we collect your name, phone number, email address and delivery address so that we can process and deliver your order and respond to you.

## How we use it
Your information is used only to fulfil orders, provide support and, if you subscribe, to send you updates. We do not sell your personal data.

## Payments
Online payments are processed by Razorpay. We never see or store your card, UPI or bank details.

## Cookies and local storage
We store your cart in your browser so that it is available on your next visit.

## Your choices
You can ask us to update or delete your data by contacting ${contact}.`,
    },
    'terms-of-service': {
      title: 'Terms of service',
      body: `## General
By using this website and placing an order you agree to these terms. ${s.storeName} may update them from time to time.

## Products and pricing
We try to show products and prices accurately. Prices are in Indian Rupees and include applicable taxes. We may cancel an order if a price or stock error occurs and will refund any amount paid.

## Orders
An order is confirmed once we accept it. We may cancel orders we cannot fulfil.

## Religious and wellness products
Rudraksha and related products are offered as devotional and traditional items. We do not make medical claims.

## Contact
Questions about these terms can be sent to ${contact}.`,
    },
  };
  return P[slug] || null;
}
