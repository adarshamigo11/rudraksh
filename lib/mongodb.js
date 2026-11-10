import mongoose from 'mongoose';

// Use the NON-SRV connection string, e.g.
// mongodb://user:pass@host1:27017,host2:27017,host3:27017/dbname?ssl=true&replicaSet=...&authSource=admin
const uri = process.env.MONGODB_URI;

let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

export default async function dbConnect() {
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to .env.local (see .env.example).');
  if (uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI uses mongodb+srv:// — please use the non-SRV string that starts with mongodb://');
  }
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000, maxPoolSize: 10 })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
  return cached.conn;
}
