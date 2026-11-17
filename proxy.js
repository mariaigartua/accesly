import { NextResponse } from "next/server";

// Services pause switch. Set SERVICES_PAUSED=true (e.g. in Vercel → Settings →
// Environment Variables, then redeploy) to keep the site browsable while blocking
// everything that writes to MongoDB or calls Gemini. Pages still read from Mongo,
// so events and spaces stay visible. The browser shows a pop-up for blocked calls
// (components/ServicesPausedDialog.js).

// POST routes that only read data (the organizer dashboards); they stay open.
const READ_ONLY_POSTS = new Set(["/api/organizer/requests", "/api/organizer/chats", "/api/organizer/events"]);

// GET routes that call Gemini.
const GEMINI_GETS = new Set(["/api/health"]);

export function proxy(request) {
  if (process.env.SERVICES_PAUSED !== "true") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const method = request.method;
  const allowed =
    method === "OPTIONS" ||
    ((method === "GET" || method === "HEAD") && !GEMINI_GETS.has(pathname)) ||
    (method === "POST" && READ_ONLY_POSTS.has(pathname));
  if (allowed) return NextResponse.next();

  return NextResponse.json(
    { error: "For the moment, sending messages, requests and AI answers is turned off.", paused: true },
    { status: 503, headers: { "x-services-paused": "1", "retry-after": "86400" } }
  );
}

export const config = { matcher: "/api/:path*" };
