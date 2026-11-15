// Hand-picked OFFICIAL pages Ally may read (via Gemini's URL context tool) when Google Search
// isn't available. Every URL here was checked to load and be readable by Gemini (Nov 2026).
// Only add official sources (transit agency, UMass offices). Re-check a URL before adding it.

export const OFFICIAL_SOURCES = [
  {
    title: "PVTA Route 30 schedule (ramps/lifts on all buses)",
    url: "https://www.pvta.com/schedules/Rt30.pdf",
    keywords: ["bus", "pvta", "route 30", "ride the", "transit", "schedule", "downtown", "cvs", "pharmacy", "get to", "go to"],
  },
  {
    title: "PVTA Route 31 schedule (ramps/lifts on all buses)",
    url: "https://www.pvta.com/schedules/Rt31.pdf",
    keywords: ["bus", "pvta", "route 31", "ride the", "transit", "schedule", "downtown", "cvs", "pharmacy", "get to", "go to"],
  },
  {
    title: "PVTA Route 35 schedule (UMass campus shuttle)",
    url: "https://www.pvta.com/schedules/Rt35.pdf",
    keywords: ["shuttle", "campus bus", "route 35"],
  },
  {
    title: "PVTA ADA Paratransit Service",
    url: "https://pvta.com/van_service/ada_paratransit/index.php",
    keywords: ["paratransit", "van", "door to door", "door-to-door", "can't use the bus", "cannot use the bus", "eligible", "eligibility", "apply", "ride", "pick up", "pickup"],
  },
  {
    title: "UMass Transportation: PVTA routes and schedules",
    url: "https://www.umass.edu/transportation/transit/pvta-routes-and-schedules",
    keywords: ["bus", "buses", "route", "routes", "schedule", "transit", "umass transit", "shuttle", "fare", "fare-free", "get to", "go to"],
  },
  {
    title: "UMass Accessibility: Transportation and parking",
    url: "https://www.umass.edu/accessibility/transportation-and-parking",
    keywords: ["parking", "park", "accessible van", "van", "transport", "shuttle", "get around", "bus", "drive"],
  },
  {
    title: "UMass Maps and Tours (Campus Accessibility Map)",
    url: "https://www.umass.edu/planning-design-construction/maps-and-tours",
    keywords: ["building", "buildings", "entrance", "entrances", "step-free", "step free", "stairs", "elevator", "elevators", "restroom", "restrooms", "bathroom", "map", "ramp", "ramps", "door", "doors", "accessible route", "near me"],
  },
  {
    title: "UMass Accessibility: For visitors",
    url: "https://www.umass.edu/accessibility/visitors",
    keywords: ["visit", "visiting", "visitor", "visitors", "guest", "campus", "parking", "building", "buildings", "entrance", "entrances", "tour"],
  },
  {
    title: "UMass Accessibility: Accommodations and access",
    url: "https://www.umass.edu/accessibility/accommodations-and-access",
    keywords: ["accommodation", "access", "request", "employee", "staff", "event", "quiet", "study"],
  },
  {
    title: "UMass Disability Services",
    url: "https://www.umass.edu/disability-services/",
    keywords: ["disability services", "accommodation", "class", "classes", "exam", "test", "notes", "register", "housing", "professor", "course", "quiet", "study"],
  },
  {
    title: "UMass Disability Services: Registration FAQ",
    url: "https://www.umass.edu/disability-services/register/registrations-faq",
    keywords: ["register", "registration", "apply", "application", "documentation", "accommodation", "class", "exam"],
  },
  {
    title: "UMass Accessibility: Planning an accessible event",
    url: "https://www.umass.edu/accessibility/planning-accessible-event",
    keywords: ["event", "organize", "organise", "host", "captions", "interpreter", "asl", "club", "meeting"],
  },
];

const escape = (k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Whole words/phrases only, so "paratransit" doesn't match "transit" and "accessible" doesn't match "access".
const hasWord = (text, k) => new RegExp(`(^|[^a-z0-9])${escape(k)}($|[^a-z0-9])`).test(text);

/** Up to `max` official pages relevant to the question (best keyword matches first). */
export function pickSources(question, max = 2) {
  const q = String(question).toLowerCase().replace(/[’']/g, "'");
  return OFFICIAL_SOURCES.map((s) => ({ s, score: s.keywords.filter((k) => hasWord(q, k)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.s);
}
