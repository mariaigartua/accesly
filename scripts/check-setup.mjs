// npm run check — verifies .env.local, MongoDB Atlas, and the Gemini key without starting Next.
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

let failed = false;
const pass = (m) => console.log(`✓ ${m}`);
const fail = (m) => {
  failed = true;
  console.log(`✗ ${m}`);
};

const { MONGODB_URI, MONGODB_DB = "accessibility", GEMINI_API_KEY, GEMINI_MODEL = "gemini-3.8-flash" } = process.env;

// MongoDB
if (!MONGODB_URI) fail("MONGODB_URI is not set");
else {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db(MONGODB_DB).command({ ping: 1 });
    pass(`MongoDB Atlas connected (db: ${MONGODB_DB})`);
  } catch (e) {
    fail(`MongoDB: ${e.message}`);
    if (/timed out|ENOTFOUND|Server selection/i.test(e.message)) {
      console.log("  → In Atlas, check Network Access allows your current IP.");
    }
    if (/auth/i.test(e.message)) console.log("  → Check the database user's username/password in the URI.");
  } finally {
    await client.close().catch(() => {});
  }
}

// Gemini
if (!GEMINI_API_KEY) fail("GEMINI_API_KEY is not set");
else {
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const res = await ai.models.generateContent({ model: GEMINI_MODEL, contents: "Reply with exactly: pong" });
    pass(`Gemini (${GEMINI_MODEL}) replied: ${(res.text ?? "").trim().slice(0, 40)}`);
  } catch (e) {
    fail(`Gemini: ${e.message}`);
    if (/not found|404/i.test(e.message)) console.log("  → Try another model name in GEMINI_MODEL.");
  }
}

process.exit(failed ? 1 : 0);
