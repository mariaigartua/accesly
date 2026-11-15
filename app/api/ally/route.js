import { collections } from "@/lib/mongodb";
import { generateGrounded, generateText, generateWithUrls, markSearchUnavailable, searchAvailable } from "@/lib/gemini";
import { ALLY_SYSTEM, ALLY_HELP_SYSTEM, ALLY_NO_SEARCH_SYSTEM, ALLY_OFFICIAL_SOURCES_SYSTEM } from "@/lib/prompts";
import { pickSources } from "@/lib/allySources";
import { PROFILE_NEEDS, needLabel } from "@/lib/labels";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

const MAX_QUESTION = 1000;

/** Splits Ally's tagged reply (ANSWER / CONFIRM / SURE / USED_ACCESSLY_DATA) into fields. */
function parseReply(text) {
  const grab = (tag, next) => {
    const re = new RegExp(`${tag}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${next}):|$)`, "i");
    return text.match(re)?.[1]?.trim() ?? "";
  };
  const tags = "ANSWER|CONFIRM|SURE|USED_ACCESSLY_DATA";
  const answer = grab("ANSWER", tags);
  if (!answer) return { answer: text.trim(), caution: "", sure: false, usedSpaces: false };
  const caution = grab("CONFIRM", tags);
  return {
    answer,
    caution: /^none\.?$/i.test(caution) ? "" : caution,
    sure: /^yes/i.test(grab("SURE", tags)),
    usedSpaces: /^yes/i.test(grab("USED_ACCESSLY_DATA", tags)),
  };
}

/** Compact Spaces data for the prompt (campus scale is small, so we include all, capped). */
async function spacesContext() {
  const { spaces } = await collections();
  const list = await spaces.find({}, { projection: { building: 1, room: 1, features: 1, reports: { $slice: -3 } } }).limit(25).toArray();
  return list.map((s) => ({
    place: [s.building, s.room].filter(Boolean).join(", "),
    features: Object.fromEntries(
      Object.entries(s.features ?? {}).map(([k, v]) => [k, v?.lastVerified ? `${v.value} (last checked ${v.lastVerified})` : String(v?.value ?? v)])
    ),
    recentReports: (s.reports ?? []).map((r) => r.text),
  }));
}

// POST /api/ally  { question, needs?: [type], mode?: "help", history?: [{ role, text }] }
// → { answer, sources: [{ title, url }], usedSpaces, caution, sure, searchSuggestionsHtml, method }
// method: "search" (Google Search grounding) → "official-pages" (reads hand-picked official pages
// from lib/allySources.js) → "accessly-only" (strictly Accessly data). Never answers from model memory.
// Privacy: questions are never stored or logged. Only the needs the person chose to share are sent.
export async function POST(req) {
  const body = await readJson(req);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) return bad("Ask a question.");
  if (question.length > MAX_QUESTION) return bad(`Keep your question under ${MAX_QUESTION} characters.`);

  const needs = Array.isArray(body?.needs) ? body.needs.filter((n) => PROFILE_NEEDS.includes(n)) : [];
  const history = (Array.isArray(body?.history) ? body.history : [])
    .slice(-4)
    .filter((m) => typeof m?.text === "string")
    .map((m) => `${m.role === "user" ? "Person" : "Ally"}: ${m.text.slice(0, 1500)}`)
    .join("\n");

  try {
    if (body?.mode === "help") {
      const text = await generateText({ system: ALLY_HELP_SYSTEM, prompt: `${history ? `CONVERSATION SO FAR:\n${history}\n\n` : ""}QUESTION: ${question}` });
      return ok({ ...parseReply(text), usedSpaces: false, sources: [], searchSuggestionsHtml: "", mode: "help" });
    }

    const prompt = [
      `ACCESSLY SPACES DATA (UMass Amherst):\n${JSON.stringify(await spacesContext(), null, 1)}`,
      needs.length ? `THE PERSON CHOSE TO SHARE THESE NEEDS: ${needs.map(needLabel).join(", ")}` : "",
      history ? `CONVERSATION SO FAR:\n${history}` : "",
      `QUESTION: ${question}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    // 1) Google Search grounding (skipped for an hour after a quota error).
    if (searchAvailable()) {
      try {
        const { text, sources, searchSuggestionsHtml } = await generateGrounded({ system: ALLY_SYSTEM, prompt });
        const parsed = parseReply(text);
        if (!sources.length && !parsed.usedSpaces) parsed.sure = false; // nothing verified
        return ok({ ...parsed, sources: sources.slice(0, 8), searchSuggestionsHtml, method: "search" });
      } catch (e) {
        markSearchUnavailable(e);
      }
    }

    // 2) Read hand-picked official pages (PVTA, UMass) with the URL context tool.
    const official = pickSources(question);
    if (official.length) {
      try {
        const pages = official.map((s) => `- ${s.title}: ${s.url}`).join("\n");
        // URLs first: the URL context tool only reliably reads pages the prompt leads with.
        const { text, readUrls } = await generateWithUrls({
          system: ALLY_OFFICIAL_SOURCES_SYSTEM,
          prompt: `Read each of these official pages before answering:\n${pages}\n\nQUESTION: ${question}\n\n${prompt}`,
        });
        // Only cite pages that were actually retrieved.
        const norm = (u) => String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
        const sources = official.filter((s) => readUrls.some((u) => norm(u) === norm(s.url))).map(({ title, url }) => ({ title, url }));
        if (sources.length) {
          const parsed = parseReply(text);
          return ok({ ...parsed, sources, searchSuggestionsHtml: "", method: "official-pages" });
        }
        console.error("Ally official pages: none retrieved", JSON.stringify(readUrls));
      } catch (e) {
        // Logs the error only, never the question.
        console.error("Ally official pages failed:", String(e?.message ?? e).slice(0, 300));
      }
    }

    // 3) Strictly Accessly data; for anything else Ally says it can't check and who to ask.
    const text = await generateText({ system: ALLY_NO_SEARCH_SYSTEM, prompt });
    const parsed = parseReply(text);
    if (!parsed.usedSpaces) parsed.sure = false;
    return ok({ ...parsed, sources: [], searchSuggestionsHtml: "", method: "accessly-only" });
  } catch {
    return bad("Ally is busy right now. Please try again in a moment.", 503);
  }
}
