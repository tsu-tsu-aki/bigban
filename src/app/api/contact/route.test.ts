import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: mockSend } };
  }),
}));

const VALID_BODY = {
  name: "山田太郎",
  email: "taro@example.com",
  phone: "090-1234-5678",
  category: "court",
  message: "コートの予約について問い合わせます",
};

function createRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function omit(obj: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
  });

  it("有効な入力で201を返し、Resendのemails.sendが正しい引数で呼ばれる", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const { POST } = await import("./route");
    const response = await POST(createRequest(VALID_BODY));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledOnce();

    const sendArg = mockSend.mock.calls[0][0];
    expect(sendArg.from).toBe(
      "THE PICKLE BANG THEORY <onboarding@resend.dev>",
    );
    expect(sendArg.to).toBe("hello@rstagency.com");
    expect(sendArg.subject).toContain("山田太郎");
    expect(sendArg.text).toContain("山田太郎");
    expect(sendArg.text).toContain("taro@example.com");
    expect(sendArg.text).toContain("090-1234-5678");
    expect(sendArg.text).toContain("court");
    expect(sendArg.text).toContain("コートの予約について問い合わせます");
  });

  it("名前なしで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, name: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("名前フィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "name")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("無効メールで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("メールフィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "email")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("カテゴリなしで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, category: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("無効なカテゴリで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, category: "invalid" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("カテゴリフィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "category")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("メッセージなしで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, message: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("メッセージフィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "message")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("Resend失敗で500を返す", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "API error", name: "api_error" },
    });

    const { POST } = await import("./route");
    const response = await POST(createRequest(VALID_BODY));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("電話番号なし（任意項目）で201を返す", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_456" }, error: null });

    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "phone")));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledOnce();

    const sendArg = mockSend.mock.calls[0][0];
    expect(sendArg.text).not.toContain("090-1234-5678");
  });
});
