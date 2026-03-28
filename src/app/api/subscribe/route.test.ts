import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { contacts: { create: mockCreate } };
  }),
}));

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
  });

  it("有効なメールで 201 を返す", async () => {
    mockCreate.mockResolvedValue({
      data: { id: "contact_123" },
      error: null,
    });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockCreate).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("空文字のメールで 400 を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("不正な形式のメールで 400 を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("Resend API エラー時に 500 を返す", async () => {
    mockCreate.mockResolvedValue({
      data: null,
      error: { message: "API error", name: "api_error" },
    });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("email フィールドが無いリクエストで 400 を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
