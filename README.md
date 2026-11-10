# Rudraksha Store

A complete e-commerce website (storefront + admin panel) for selling Rudraksha, inspired by japam.in.
Built with **Next.js 14 (App Router)**, **Tailwind CSS** and **MongoDB** using the **non-SRV** connection string.

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit the values
npm run dev                    # http://localhost:3000
```

Optional: `npm run seed` adds sample categories, products and coupons.

Admin panel: **/admin** — sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | **Non-SRV** string, starts with `mongodb://` (see below) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes | Admin login |
| `JWT_SECRET` | yes | Random string. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | recommended | Your live URL (sitemap / SEO) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | optional | Enables UPI/card payments. Without them the store runs Cash-on-Delivery only |

### Getting the non-SRV MongoDB string (Atlas)
Connect → Drivers → Node.js → choose version **"2.2.12 or later"** → copy the long `mongodb://host1,host2,host3/...` string.
Replace `<password>` (URL-encode special characters such as `@` → `%40`) and add your database name before the `?`.
Allow your server's IP (or `0.0.0.0/0` for Vercel) under Atlas → Network Access.

## What's included

**Storefront**
- Home (hero, trust strip, categories, bestsellers, featured, new arrivals, customer reviews)
- Shop with search, category pills, price filter, sorting, pagination
- Product page: image gallery, size/variant selector, discount %, energization (Pran Pratishta) add-on, quantity, Add to cart / Buy now / COD order, pincode delivery estimate, public coupons, description with images, details table, FAQs, shipping info, reviews + review form, related products, SEO + JSON-LD
- Cart drawer + cart page with free-shipping progress bar (cart saved in browser)
- Checkout: address with pincode auto-fill, coupon codes, Cash on Delivery and Razorpay online payment; prices are always recalculated on the server
- Order confirmation page, order tracking (order number + phone), WhatsApp chat button
- About, Contact, Shipping / Returns / Privacy / Terms pages (starter text — review before going live), sitemap.xml, robots.txt

**Admin panel (/admin)**
- Dashboard: sales, today's orders, 7-day chart, low-stock list, recent orders
- Products: add / edit / delete, multiple images (reorder, auto-resized), rich description with images, variants with own price & stock, details table, FAQs, tags, SEO fields, featured / bestseller / hidden toggles
- Categories (with images), Coupons (flat / percent, minimum order, expiry, usage limit), Orders (status, payment status, courier & tracking, notes, WhatsApp customer, print, CSV export, auto-restock on cancel), Review moderation, Contact messages & newsletter list
- Settings: store name, hero, announcement bar, shipping fee, free-shipping limit, COD fee, online-payment discount, energization price, delivery days, contact & social links

## How images are stored
Uploaded images are stored in MongoDB and served from `/api/images/<id>` with long cache headers, so no extra storage service is needed.
Photos are shrunk in the browser before upload. For a large catalogue you may later move to Cloudinary / S3.

## Deploying to Vercel
1. Push to GitHub and import the repo in Vercel.
2. Add the environment variables above.
3. Deploy. Visit `/admin`, then fill in **Settings**, add **Categories** and **Products**.

## Good to know
- Unpaid online orders keep their stock reserved until you cancel them in the admin (cancelling restocks automatically).
- Razorpay: the payment is verified when the customer returns to the site. For extra safety you can later add a Razorpay webhook.
- No customer accounts — customers check out as guests and track orders by order number + phone.
- The default policy pages and badges are generic; edit `lib/policies.js` and Settings to match your business.
