import { NextResponse } from "next/server";

export const ok = (data, status = 200) => NextResponse.json(data, { status });
export const bad = (message, status = 400) => NextResponse.json({ error: message }, { status });

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
