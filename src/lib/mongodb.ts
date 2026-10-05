import { MongoClient, Db } from 'mongodb';

const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || 'arvr_coe';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Automatically sanitizes and percent-encodes special characters (such as '@') in the password
 * component of a MongoDB connection URI to prevent MongoParseError: Invalid connection string.
 */
export function sanitizeMongoUri(rawUri?: string): string | null {
  if (!rawUri || rawUri.trim().length === 0) return null;
  const trimmed = rawUri.trim().replace(/^["']|["']$/g, '');

  const match = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^/?#]+)(.*)$/);
  if (!match) return trimmed;

  const [, proto, user, rawPass, host, rest] = match;

  let pass = rawPass;
  try {
    pass = decodeURIComponent(rawPass);
  } catch {
    // Keep rawPass if decode fails
  }
  const encodedPass = encodeURIComponent(pass);

  let cleanUser = user;
  try {
    cleanUser = decodeURIComponent(user);
  } catch {
    // Keep user if decode fails
  }
  const encodedUser = encodeURIComponent(cleanUser);

  return `${proto}${encodedUser}:${encodedPass}@${host}${rest}`;
}

/**
 * Checks if a MongoDB connection string is configured in the environment.
 */
export function isMongoConfigured(): boolean {
  const uri = process.env.MONGODB_URI;
  return Boolean(uri && uri.trim().length > 0);
}

/**
 * Retrieves the cached or newly initiated MongoClient instance.
 * In development, utilizes a global singleton to avoid connection exhaustion during hot-reloads.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const mongoUri = sanitizeMongoUri(process.env.MONGODB_URI);
  if (!mongoUri) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        client = new MongoClient(mongoUri);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(mongoUri);
        clientPromise = client.connect();
      }
    }

    return await clientPromise;
  } catch (err) {
    console.warn('MongoDB connection unavailable. Operating in local JSON fallback mode:', err);
    return null;
  }
}

/**
 * Returns the target database instance if connected, or null if unconfigured/failed.
 */
export async function getMongoDb(): Promise<Db | null> {
  const clientInstance = await getMongoClient();
  if (!clientInstance) return null;
  return clientInstance.db(dbName);
}
