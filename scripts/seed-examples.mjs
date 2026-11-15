// npm run seed:examples — loads the demo set: 8 fictional UMass-flavored spaces + 10 upcoming events.
// The places are made up (not real buildings), so no real building facts are invented.
// Each doc is flagged `example: true`; re-running removes the previous set (and requests/chats on it) first.
import { MongoClient } from "mongodb";
import crypto from "node:crypto";
import { writeFileSync } from "node:fs";

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
const chats = db.collection("chats");

// ---- Remove previous examples ----
const isExampleSpace = { $or: [{ example: true }, { building: /EXAMPLE/ }] };
const isExampleEvent = { $or: [{ example: true }, { name: /^EXAMPLE/ }] };
const oldEventIds = (await events.find(isExampleEvent, { projection: { _id: 1 } }).toArray()).map((e) => e._id);
const delReq = await requests.deleteMany({ eventId: { $in: oldEventIds } });
const delChat = await chats.deleteMany({ eventId: { $in: oldEventIds } });
const delEv = await events.deleteMany(isExampleEvent);
const delSp = await spaces.deleteMany(isExampleSpace);
console.log(`✓ removed old examples: ${delSp.deletedCount} spaces, ${delEv.deletedCount} events, ${delReq.deletedCount} requests, ${delChat.deletedCount} chats`);

// ---- Spaces (fictional) ----
const day = 24 * 60 * 60 * 1000;
const ago = (n) => new Date(Date.now() - n * day).toISOString().slice(0, 10);
const f = (value, daysAgo) => ({ value, lastVerified: ago(daysAgo) });

const SPACES = [
  {
    key: "union",
    building: "Minuteman Union",
    room: "Ballroom, floor 1",
    features: {
      entrance: f("Step-free main entrance with automatic doors facing the plaza", 6),
      elevator: f("Elevator next to the information desk, serves all floors", 6),
      restrooms: f("All-gender accessible restroom on floor 1, near the ballroom", 12),
      seating: f("Movable chairs and tables; wheelchair spaces can be set up on request", 6),
      noise: f("Can get loud when the ballroom is full; a quiet lounge is across the hall", 20),
    },
    reports: [{ text: "Automatic door button on the plaza side was slow to open this week.", daysAgo: 2 }],
  },
  {
    key: "library",
    building: "North Quad Library",
    room: "Quiet Study Room 3, floor 2",
    features: {
      entrance: f("Step-free entrance on the east side via a ramp; the front steps have no ramp", 9),
      elevator: f("Two elevators in the lobby", 9),
      restrooms: f("Accessible restrooms on floors 1 and 2", 9),
      noise: f("Quiet floor: no talking above a whisper", 3),
      lighting: f("Adjustable desk lamps; overhead lights can be dimmed in study rooms", 30),
    },
    reports: [],
  },
  {
    key: "maple",
    building: "Maple Hall",
    room: "Auditorium 101",
    features: {
      entrance: f("Step-free entrance at the back of the building (Pond Road side)", 14),
      elevator: f("No elevator; the auditorium is on the ground floor", 14),
      seating: f("Fixed tiered seating; 4 wheelchair spaces in the front row", 14),
      captions: f("Projector and screen support captions; ask the organizer to turn them on", 40),
      hearing: f("Assistive listening system available; headsets at the AV desk", 40),
    },
    reports: [{ text: "Ramp at the back entrance had snow on it in the morning.", daysAgo: 1 }],
  },
  {
    key: "arts",
    building: "Hilltop Arts Center",
    room: "Black Box Theater",
    features: {
      entrance: f("Step-free entrance from the parking lot; main entrance has 6 steps", 21),
      elevator: f("Elevator to the theater level, key from the box office", 21),
      lighting: f("Shows may use strobe or flashing lights; check each event", 21),
      seating: f("Flexible seating; wheelchair spaces on the floor level", 21),
    },
    reports: [],
  },
  {
    key: "science",
    building: "Riverbend Science Building",
    room: "Lecture Hall 140",
    features: {
      entrance: f("Step-free entrance on the north side", 5),
      elevator: f("Elevators at both ends of the main hallway", 5),
      restrooms: f("Accessible restroom on every floor", 5),
      seating: f("Tiered seating; level wheelchair spaces at the top and bottom rows", 5),
      captions: f("Lecture capture with live captions for scheduled classes", 60),
    },
    reports: [],
  },
  {
    key: "rec",
    building: "Orchard Rec Center",
    room: "Multipurpose Court B",
    features: {
      entrance: f("Step-free entrance with a power-assisted door", 10),
      elevator: f("Elevator to the courts level", 10),
      noise: f("Echoey gym space, loud during games", 10),
      restrooms: f("Accessible locker room and all-gender restroom near Court B", 10),
    },
    reports: [{ text: "Elevator to the courts was out of service on Saturday.", daysAgo: 4 }],
  },
  {
    key: "dining",
    building: "Commonwealth Dining Commons",
    room: "Pond View Event Room",
    features: {
      entrance: f("Step-free entrance from the main dining hall", 8),
      dietary: f("Kitchen can label allergens and prepare vegan, gluten-free and halal options with notice", 8),
      noise: f("Separate room with a door, quieter than the main dining hall", 8),
    },
    reports: [],
  },
  {
    key: "pond",
    building: "Pondside Commons",
    room: "Lounge 120",
    features: {
      entrance: f("Step-free entrance from the pond path", 35),
      noise: f("Soft seating and carpet, usually calm", 35),
    },
    reports: [],
  },
];

const spaceIds = {};
for (const s of SPACES) {
  const { insertedId } = await spaces.insertOne({
    campus: "UMass Amherst",
    building: s.building,
    room: s.room,
    features: s.features,
    reports: s.reports.map((r) => ({ text: r.text, createdAt: new Date(Date.now() - r.daysAgo * day) })),
    example: true,
    createdAt: new Date(),
  });
  spaceIds[s.key] = insertedId;
}
console.log(`✓ ${SPACES.length} example spaces`);

// ---- Events (fictional orgs, upcoming) ----
function at(daysFromNow, hour, minute = 0) {
  const d = new Date(Date.now() + daysFromNow * day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const EVENTS = [
  {
    name: "Accessible Game Night",
    org: "Board Game Society",
    description: "Board games, card games and snacks. All games have large-print rule cards. Drop in any time.",
    space: "union", start: at(2, 18), hours: 3,
    accessibility: {
      food: "Snacks with allergen labels; vegan and gluten-free options",
      seating: "Tables at wheelchair height; reserved seats near the entrance",
      materials: "Large-print rule cards for every game",
      noise: "Quiet table in the corner for anyone who wants a calmer space",
    },
  },
  {
    name: "Study Skills Workshop",
    org: "Peer Mentors",
    description: "Tips for finals: planning, note-taking and focus. Slides shared a day before.",
    space: "library", start: at(3, 16), hours: 1.5,
    accessibility: {
      materials: "Slides and handouts emailed in advance to anyone who asks",
      captions: "Live captions on the screen",
      noise: "Small group in a quiet study room",
    },
  },
  {
    name: "Disability Pride Panel",
    org: "Disabled Students Alliance",
    description: "Student and alumni panel on disability, identity and campus life, followed by Q&A.",
    space: "maple", start: at(4, 19), hours: 2,
    accessibility: {
      asl: "Two ASL interpreters confirmed",
      captions: "CART live captioning on the main screen",
      seating: "Front-row wheelchair spaces and reserved seats near the aisle",
      materials: "Panel questions shared in advance",
    },
  },
  {
    name: "Open Mic Night",
    org: "Poetry Collective",
    description: "Poetry, music and comedy. Sign up at the door or just listen.",
    space: "arts", start: at(5, 20), hours: 2.5,
    accessibility: {
      lighting: "No strobe lights; stage lights stay steady",
      seating: "Mix of chairs and cushions; floor-level wheelchair spaces",
    },
  },
  {
    name: "Intro to Robotics Talk",
    org: "Robotics Club",
    description: "A beginner-friendly talk on building your first robot, with live demos.",
    space: "science", start: at(6, 17, 30), hours: 1.5,
    accessibility: {
      captions: "Auto captions on the projector",
      materials: "Slides posted online after the talk",
    },
  },
  {
    name: "Adaptive Sports Day",
    org: "Adaptive Athletics",
    description: "Try wheelchair basketball, goalball and seated volleyball. Equipment provided, all levels welcome.",
    space: "rec", start: at(8, 13), hours: 3,
    accessibility: {
      equipment: "Sports wheelchairs and goalball eyeshades provided",
      noise: "Gym gets loud; ear defenders available at the check-in table",
      restrooms: "Accessible locker room next to the court",
    },
  },
  {
    name: "International Food Festival",
    org: "International Students Union",
    description: "Dishes from around the world, made by student clubs. Every dish has an ingredients card.",
    space: "dining", start: at(9, 17), hours: 2,
    accessibility: {
      food: "Every dish labelled with ingredients and allergens; vegan, halal and gluten-free options",
      seating: "Seating area with tables; servers can bring food to your table",
    },
  },
  {
    name: "Mindful Mornings",
    org: "Wellness Collective",
    description: "A calm guided meditation to start the day. Chairs and mats available.",
    space: "pond", start: at(10, 9), hours: 1,
    accessibility: {
      noise: "Quiet, low-stimulation room",
      seating: "Chairs, floor mats and cushions; join from a chair or wheelchair",
    },
  },
  {
    name: "Club Fair",
    org: "Student Activities",
    description: "Meet 40+ student clubs, grab freebies and sign up for newsletters.",
    space: "union", start: at(12, 11), hours: 4,
    accessibility: {
      noise: "Busy and loud; quieter hour from 11 to 12 with no music",
    },
  },
  {
    name: "Film Screening & Discussion",
    org: "Film Society",
    description: "Screening of a short documentary on accessible design, then an open discussion.",
    space: "maple", start: at(15, 19), hours: 2,
    accessibility: {
      captions: "Open captions on the film",
      hearing: "Assistive listening headsets at the AV desk",
    },
  },
];

const keys = [];
for (const e of EVENTS) {
  const organizerKey = crypto.randomBytes(16).toString("hex");
  const { insertedId } = await events.insertOne({
    name: e.name,
    org: e.org,
    description: e.description,
    startsAt: e.start,
    endsAt: new Date(e.start.getTime() + e.hours * 60 * 60 * 1000),
    spaceId: spaceIds[e.space],
    accessibility: e.accessibility,
    organizerKey,
    example: true,
    createdAt: new Date(),
  });
  keys.push({ name: e.name, id: String(insertedId), organizerKey });
}
console.log(`✓ ${EVENTS.length} example events`);
// Keys are saved locally (gitignored) so you can paste one into the Organizer tab to manage that event.
const KEYS_FILE = "example-organizer-keys.txt";
writeFileSync(
  KEYS_FILE,
  "Demo event organizer keys (local only, never commit). Paste a key in Organizer to manage that event.\n\n" +
    keys.map((k) => `${k.name}\n  event: /events/${k.id}\n  key:   ${k.organizerKey}\n`).join("\n"),
);
console.log(`✓ organizer keys saved to ${KEYS_FILE} (gitignored)`);

await client.close();
