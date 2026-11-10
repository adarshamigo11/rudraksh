import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { json, handleError, httpError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await dbConnect();
    const b = await req.json();
    if (b.website) return json({ ok: true }); // honeypot field — bots fill it in
    if (!mongoose.isValidObjectId(b.productId)) throw httpError(400, 'Invalid product');
    const rating = Math.round(Number(b.rating));
    const name = String(b.name || '').trim().slice(0, 60);
    const comment = String(b.comment || '').trim().slice(0, 1000);
    if (!(rating >= 1 && rating <= 5)) throw httpError(400, 'Please choose a star rating');
    if (name.length < 2) throw httpError(400, 'Please enter your name');
    if (comment.length < 3) throw httpError(400, 'Please write a short review');
    if (!(await Product.exists({ _id: b.productId }))) throw httpError(404, 'Product not found');
    await Review.create({
      product: b.productId,
      name,
      rating,
      title: String(b.title || '').trim().slice(0, 100),
      comment,
      approved: false,
    });
    return json({ ok: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}
