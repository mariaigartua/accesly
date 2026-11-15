// npm run seed — creates indexes and one clearly-labelled EXAMPLE space + event.
// Replace the example space with real, verified info before your demo.
import { MongoClient } from "mongodb";
import crypto from "node:crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "accessibility";
if (!uri) {
  console.error("MONGODB_URI missing — fill in .env.local first.");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const spaces = db.collection("spaces");
const events = db.collection("events");
const requests = db.collection("requests");

// Indexes
await events.createIndex({ startsAt: 1 });
await requests.createIndex({ eventId: 1, createdAt: -1 });
await requests.createIndex({ accessToken: 1 }, { unique: true });
// Privacy: MongoDB deletes each request automatically once `deleteAfter` passes.
await requests.createIndex({ deleteAfter: 1 }, { expireAfterSeconds: 0 });
console.log("✓ indexes");

const today = new Date().toISOString().slice(0, 10);
const { insertedId: spaceId } = await spaces.insertOne({
  building: "EXAMPLE Hall (replace me)",
  room: "Room 101",
  features: {
    entrance: { value: "Step-free entrance on the north side (EXAMPLE)", lastVerified: today },
    elevator: { value: "Yes, next to the north entrance (EXAMPLE)", lastVerified: today },
    restrooms: { value: "All-gender accessible restroom on floor 1 (EXAMPLE)", lastVerified: today },
    noise: { value: "Echoey when full (EXAMPLE)", lastVerified: today },
  },
  reports: [],
  createdAt: new Date(),
});
console.log("✓ example space", String(spaceId));

const startsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
const organizerKey = crypto.randomBytes(16).toString("hex");
const { insertedId: eventId } = await events.insertOne({
  name: "EXAMPLE: Club Kickoff Social",
  org: "Example Student Org",
  description: "Meet the club, play games, eat pizza.",
  startsAt,
  endsAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
  spaceId,
  accessibility: {
    food: "Pizza, including a vegan option. Allergen labels on each box.",
    noise: "Background music, turned down after 7pm.",
    seating: "Chairs and tables throughout; some spots near the exit.",
  },
  organizerKey,
  createdAt: new Date(),
});
console.log("✓ example event", String(eventId));
console.log("  organizer key (for the request dashboard):", organizerKey);
console.log(`  attendee page:   http://localhost:3000/events/${eventId}`);
console.log(`  organizer queue: http://localhost:3000/organizer/${eventId}`);

await client.close();
