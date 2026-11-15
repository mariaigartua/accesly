// Short, shareable event links: /e/<slug> (e.g. /e/game-night). Used on fliers and QR codes.

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/; // 3–40 chars, no leading/trailing hyphen
export const SLUG_HELP = "3 to 40 characters: lowercase letters, numbers and hyphens.";

/** "Accessible Game Night!" → "accessible-game-night" */
export function slugify(text) {
  const s = String(text ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s.length >= 3 ? s : s ? `${s}-event` : "event";
}

/** A free slug based on `text`: tries "name", then "name-2", "name-3"… */
export async function uniqueSlug(events, text, exceptId = null) {
  const base = slugify(text).slice(0, 36).replace(/-+$/g, "");
  for (let n = 1; n < 50; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const taken = await events.findOne({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }, { projection: { _id: 1 } });
    if (!taken) return slug;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Full URL for a short link. Uses NEXT_PUBLIC_SITE_URL when set (e.g. the deployed domain). */
export function shortUrl(slug, origin) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || origin || "").replace(/\/+$/, "");
  return `${site}/e/${slug}`;
}
