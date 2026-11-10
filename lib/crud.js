import dbConnect from './mongodb';
import { requireAdmin } from './guard';
import { json, handleError } from './api';

const STRIP = ['_id', '__v', 'createdAt', 'updatedAt'];
const clean = (b) => {
  const o = { ...b };
  STRIP.forEach((k) => delete o[k]);
  return o;
};

export function collectionHandlers(Model, { sort = { createdAt: -1 }, prepare, populate } = {}) {
  return {
    async GET() {
      try {
        await requireAdmin();
        await dbConnect();
        let q = Model.find().sort(sort);
        if (populate) q = q.populate(populate);
        return json(await q.lean());
      } catch (e) {
        return handleError(e);
      }
    },
    async POST(req) {
      try {
        await requireAdmin();
        await dbConnect();
        let body = clean(await req.json());
        if (prepare) body = await prepare(body);
        const doc = await Model.create(body);
        return json(doc, 201);
      } catch (e) {
        return handleError(e);
      }
    },
  };
}

export function itemHandlers(Model, { prepare, after } = {}) {
  return {
    async GET(_req, { params }) {
      try {
        await requireAdmin();
        await dbConnect();
        const doc = await Model.findById(params.id).lean();
        return doc ? json(doc) : json({ error: 'Not found' }, 404);
      } catch (e) {
        return handleError(e);
      }
    },
    async PUT(req, { params }) {
      try {
        await requireAdmin();
        await dbConnect();
        let body = clean(await req.json());
        if (prepare) body = await prepare(body, params.id);
        const doc = await Model.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true });
        if (!doc) return json({ error: 'Not found' }, 404);
        if (after) await after(doc, 'update');
        return json(doc);
      } catch (e) {
        return handleError(e);
      }
    },
    async DELETE(_req, { params }) {
      try {
        await requireAdmin();
        await dbConnect();
        const doc = await Model.findByIdAndDelete(params.id);
        if (!doc) return json({ error: 'Not found' }, 404);
        if (after) await after(doc, 'delete');
        return json({ ok: true });
      } catch (e) {
        return handleError(e);
      }
    },
  };
}
