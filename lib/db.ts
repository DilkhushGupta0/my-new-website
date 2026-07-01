import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri?: string;
}

let cached: Cached = (global as any).mongoose || { conn: null, promise: null, uri: undefined };

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, uri: undefined };
}

export async function connectDB() {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    if (cached.uri !== MONGODB_URI) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
    } else {
      return cached.conn;
    }
  }

  if (!cached.promise) {
    cached.uri = MONGODB_URI;
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
