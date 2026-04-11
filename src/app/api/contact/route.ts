import { Resend } from "resend";
import { NextResponse } from "next/server";
import { buildAutoReplyHtml, buildAutoReplyText } from "@/lib/email-templates";

interface ContactRequestBody {
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_CATEGORIES = new Set(["court", "lesson", "press", "other"]);

const CATEGORY_LABELS: Record<string, string> = {
  court: "コート予約",
  lesson: "レッスン",
  press: "取材",
  other: "その他",
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactRequestBody;

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const category = body.category?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { success: false, error: "名前を入力してください" },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, error: "有効なメールアドレスを入力してください" },
      { status: 400 },
    );
  }

  if (!category || !VALID_CATEGORIES.has(category)) {
    return NextResponse.json(
      { success: false, error: "カテゴリを選択してください" },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { success: false, error: "メッセージを入力してください" },
      { status: 400 },
    );
  }

  // category is validated against VALID_CATEGORIES, all of which have labels
  const categoryLabel = CATEGORY_LABELS[category] as string;

  const textLines = [
    `名前: ${name}`,
    `メール: ${email}`,
    ...(phone ? [`電話: ${phone}`] : []),
    `カテゴリ: ${categoryLabel}`,
    `メッセージ:\n${message}`,
  ];

  const from = process.env.RESEND_FROM;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!from || !toEmail || !apiKey) {
    return NextResponse.json(
      { success: false, error: "サーバー設定エラー" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  const adminEmail = resend.emails.send({
    from,
    to: toEmail,
    subject: `【${categoryLabel}】${name}様からのお問い合わせ`,
    text: textLines.join("\n"),
  });

  const replyParams = { name, categoryLabel, message };
  const autoReply = resend.emails.send({
    from,
    to: email,
    subject: "【THE PICKLE BANG THEORY】お問い合わせありがとうございます",
    html: buildAutoReplyHtml(replyParams),
    text: buildAutoReplyText(replyParams),
  });

  const [adminResult, replyResult] = await Promise.allSettled([adminEmail, autoReply]);

  const adminFailed =
    adminResult.status === "rejected" ||
    (adminResult.status === "fulfilled" && adminResult.value.error);

  if (adminFailed) {
    return NextResponse.json(
      { success: false, error: "送信に失敗しました" },
      { status: 500 },
    );
  }

  const replyFailed =
    replyResult.status === "rejected" ||
    (replyResult.status === "fulfilled" && replyResult.value.error);

  if (replyFailed) {
    console.error("自動返信メールの送信に失敗しました:", replyResult);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
