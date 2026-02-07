import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    if (!uri) {
      // Create a promise that rejects when awaited
      globalWithMongo._mongoClientPromise = Promise.reject(new Error('Please add your Mongo URI to .env'));
      // Prevent unhandled rejection at module level
      globalWithMongo._mongoClientPromise.catch(() => {});
    } else {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  if (!uri) {
    // Create a promise that rejects when awaited
    clientPromise = Promise.reject(new Error('Please add your Mongo URI to environment variables'));
    // Prevent unhandled rejection at module level
    clientPromise.catch(() => {});
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
