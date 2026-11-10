import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Image from '@/models/Image';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  try {
    if (!mongoose.isValidObjectId(params.id)) return new Response('Not found', { status: 404 });
    await dbConnect();
    const img = await Image.findById(params.id);
    if (!img) return new Response('Not found', { status: 404 });
    return new Response(img.data, {
      headers: {
        'Content-Type': img.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
