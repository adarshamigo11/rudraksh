import dbConnect from '@/lib/mongodb';
import Image from '@/models/Image';
import { requireAdmin } from '@/lib/guard';
import { json, handleError, httpError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await requireAdmin();
    await dbConnect();
    const form = await req.formData();
    const files = form.getAll('files');
    if (!files.length) throw httpError(400, 'No files received');
    const urls = [];
    for (const f of files) {
      if (typeof f === 'string') continue;
      if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(f.type)) throw httpError(400, 'Only PNG, JPG, WEBP, GIF or AVIF images are allowed');
      if (f.size > 4 * 1024 * 1024) throw httpError(400, 'Image is too large (max 4 MB)');
      const buf = Buffer.from(await f.arrayBuffer());
      const img = await Image.create({ data: buf, contentType: f.type, name: f.name, size: buf.length });
      urls.push(`/api/images/${img._id}`);
    }
    return json({ urls });
  } catch (e) {
    return handleError(e);
  }
}
