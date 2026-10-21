import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'campusfix';

if (!uri) {
  throw new Error('MONGODB_URI is missing from .env.local');
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise =
  globalForMongo.mongoClientPromise ??
  new MongoClient(uri).connect();

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongoClientPromise = clientPromise;
}

export async function getMongoDb() {
  const client = await clientPromise;
  return client.db(dbName);
}
