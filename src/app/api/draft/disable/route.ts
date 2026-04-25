import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  (await draftMode()).disable();
  (await cookies()).delete("microcms_draft_key");
  return NextResponse.json({ ok: true });
}
