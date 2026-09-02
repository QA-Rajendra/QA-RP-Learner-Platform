import mongoose from 'mongoose';
import dns from 'dns';

function applyDnsFix() {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {}
}

applyDnsFix();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  applyDnsFix();
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then(m => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default connectDB;