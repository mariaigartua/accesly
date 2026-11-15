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

// One-time setup per server process: indexes the privacy rules depend on, plus small data
// migrations. Idempotent, so it's safe on every start (and also done in scripts/seed.mjs).
async function ensureSetup(db) {
  if (!globalForMongo._accesslySetup) {
    globalForMongo._accesslySetup = (async () => {
      const chats = db.collection("chats");
      const requests = db.collection("requests");
      await Promise.all([
        // Privacy: MongoDB deletes each chat/request automatically once `deleteAfter` passes.
        chats.createIndex({ deleteAfter: 1 }, { expireAfterSeconds: 0 }),
        chats.createIndex({ accessToken: 1 }, { unique: true }),
        chats.createIndex({ eventId: 1, updatedAt: -1 }),
        requests.createIndex({ deleteAfter: 1 }, { expireAfterSeconds: 0 }),
        db.collection("events").createIndex({ organizerKey: 1 }),
        // Short links /e/<slug>: unique, but older events may not have one yet.
        db.collection("events").createIndex({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: "string" } } }),
        // Status rename: "pending" → "awaiting".
        requests.updateMany({ status: "pending" }, { $set: { status: "awaiting" } }),
      ]);
    })().catch((e) => {
      globalForMongo._accesslySetup = undefined; // retry next time
      console.error("Mongo setup failed:", e.message);
    });
  }
  return globalForMongo._accesslySetup;
}

export async function collections() {
  const db = await getDb();
  await ensureSetup(db);
  return {
    spaces: db.collection("spaces"),
    events: db.collection("events"),
    requests: db.collection("requests"),
    chats: db.collection("chats"),
  };
}

/** Returns an ObjectId, or null if the string isn't a valid id. */
export function toObjectId(id) {
  return typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : null;
}
