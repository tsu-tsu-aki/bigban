import { createResendClient } from "@/lib/resend";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as Record<string, unknown>).email === "string"
      ? (body as Record<string, unknown>).email as string
      : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const resend = createResendClient();
    const { data, error } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (error) {
      if (error.name === "rate_limit_exceeded") {
        return Response.json({ error: "Too many requests" }, { status: 429 });
      }
      if (error.name === "validation_error") {
        return Response.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return Response.json({ id: data?.id }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
