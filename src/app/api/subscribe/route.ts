import { Resend } from "resend";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim() ?? "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, error: "有効なメールアドレスを入力してください" },
      { status: 400 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.contacts.create({ email });

  if (error) {
    return NextResponse.json(
      { success: false, error: "登録に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
