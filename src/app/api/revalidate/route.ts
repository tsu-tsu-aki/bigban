import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const webhookSchema = z.object({
  service: z.string().optional(),
  api: z.string(),
  id: z.string().optional(),
  type: z.string().optional(),
});

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.MICROCMS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 },
    );
  }

  const sig = request.headers.get("x-microcms-signature");
  const rawBody = await request.text();

  if (!sig) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  if (!safeEqualHex(sig, expected)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = webhookSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    );
  }

  if (parsed.data.api !== "news") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const tags: string[] = ["news"];
  revalidateTag("news");
  if (parsed.data.id) {
    const jaTag = `news-${parsed.data.id}-ja`;
    const enTag = `news-${parsed.data.id}-en`;
    revalidateTag(jaTag);
    revalidateTag(enTag);
    tags.push(jaTag, enTag);
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}
