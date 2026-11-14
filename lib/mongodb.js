import { MongoClient, ObjectId } from "mongodb";

const dbName = process.env.MONGODB_DB || "accessibility";

// Reuse one client across hot reloads in dev and across requests in prod.
// Connects lazily so `next build` works even before env vars are set.
const globalForMongo = globalThis;

function clientPromise() {
  if (!globalForMongo._mongoClientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is missing. Copy .env.example to .env.local and fill it in.");
    globalForMongo._mongoClientPromise = new MongoClient(uri, { appName: "accesly" })
      .connect()
      .catch((e) => {
        globalForMongo._mongoClientPromise = undefined; // allow a retry after fixing config
        throw e;
      });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb() {
  const client = await clientPromise();
  return client.db(dbName);
}

export async function collections() {
  const db = await getDb();
  return {
    spaces: db.collection("spaces"),
    events: db.collection("events"),
    requests: db.collection("requests"),
  };
}

/** Returns an ObjectId, or null if the string isn't a valid id. */
export function toObjectId(id) {
  return typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : null;
}
