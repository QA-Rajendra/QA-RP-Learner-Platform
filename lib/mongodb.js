import mongoose from 'mongoose';
import dns from 'dns';

// Ensure IPv4 and reliable Google/Cloudflare DNS are prioritized globally
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

/**
 * Dynamically resolves SRV records using a custom Google/Cloudflare DNS resolver
 * if the default system resolver refuses the query.
 */
async function resolveDirectUriIfSrvFails(srvUri) {
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) return srvUri;
  try {
    const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)\/?([^?]*)/);
    if (match) {
      const [, user, pass, host, db] = match;
      const resolver = new dns.promises.Resolver();
      resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      const addresses = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
      if (addresses && addresses.length > 0) {
        const hostList = addresses.map((a) => `${a.name}:${a.port}`).join(',');
        const dbName = db || 'qarp_elearning';
        return `mongodb://${user}:${pass}@${hostList}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Custom SRV resolution fallback error:', err.message);
  }
  return srvUri;
}

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectWithRetry(primaryUri) {
  try {
    return await mongoose.connect(primaryUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    console.warn(`[MongoDB] Primary connection failed (${err.message}). Attempting DNS fallback resolver...`);
    const fallbackUri = await resolveDirectUriIfSrvFails(primaryUri);
    if (fallbackUri && fallbackUri !== primaryUri) {
      return await mongoose.connect(fallbackUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      });
    }
    throw err;
  }
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in your environment variables.');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry(MONGODB_URI)
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
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