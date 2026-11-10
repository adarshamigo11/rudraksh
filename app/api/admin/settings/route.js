import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { requireAdmin } from '@/lib/guard';
import { json, handleError } from '@/lib/api';
import { getSettings, sanitizeSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    return json(await getSettings());
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req) {
  try {
    await requireAdmin();
    await dbConnect();
    const incoming = sanitizeSettings(await req.json());
    const current = await getSettings();
    const data = { ...current, ...incoming };
    await Setting.findOneAndUpdate({ key: 'store' }, { $set: { data } }, { upsert: true, new: true });
    return json(data);
  } catch (e) {
    return handleError(e);
  }
}
