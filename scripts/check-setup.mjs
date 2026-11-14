// npm run check — verifies .env.local, MongoDB Atlas, and the Gemini key without starting Next.
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

let failed = false;
const pass = (m) => console.log(`✓ ${m}`);
const fail = (m) => {
  failed = true;
  console.log(`✗ ${m}`);
};

const { MONGODB_URI, MONGODB_DB = "accessibility", GEMINI_API_KEY, GEMINI_MODEL = "gemini-3.6-flash" } = process.env;

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

// Gemini (tries GEMINI_MODEL, then GEMINI_FALLBACK_MODEL if set — same as the app)
const { GEMINI_FALLBACK_MODEL } = process.env;
if (!GEMINI_API_KEY) fail("GEMINI_API_KEY is not set");
else {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY, httpOptions: { timeout: 20_000 } });
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL].filter(Boolean);
  let ok = false;
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({ model, contents: "Reply with exactly: pong" });
      pass(`Gemini (${model}) replied: ${(res.text ?? "").trim().slice(0, 40)}`);
      ok = true;
      break;
    } catch (e) {
      const msg = String(e?.message ?? e).slice(0, 200);
      console.log(`  ${model}: ${msg}`);
      if (/not found|404|no longer available/i.test(msg)) console.log("  → Model unavailable; set a different GEMINI_MODEL.");
      else if (/timed? ?out|abort/i.test(msg)) console.log(`  → No answer in 20s.`);
      else if (/503|high demand|UNAVAILABLE/i.test(msg)) console.log("  → Google says this model is overloaded right now.");
    }
  }
  if (!ok) fail(`Gemini: none of [${models.join(", ")}] answered`);
}

process.exit(failed ? 1 : 0);
