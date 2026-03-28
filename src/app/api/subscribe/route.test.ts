import { describe, it, expect, vi, beforeEach } from "vitest";

const mockContactsCreate = vi.fn();

vi.mock("@/lib/resend", () => ({
  createResendClient: vi.fn(() => ({
    contacts: {
      create: mockContactsCreate,
    },
  })),
}));

import { POST } from "./route";

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createBadJsonRequest(): Request {
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json",
  });
}

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    mockContactsCreate.mockReset();
  });

  it("有効なメールアドレスで 200 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: { id: "contact_123" },
      error: null,
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: "contact_123" });
    expect(mockContactsCreate).toHaveBeenCalledWith({
      email: "test@example.com",
      unsubscribed: false,
    });
  });

  it("不正な JSON で 400 を返す", async () => {
    const response = await POST(createBadJsonRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid request body" });
  });

  it("email が未指定で 400 を返す", async () => {
    const response = await POST(createRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("email が空文字で 400 を返す", async () => {
    const response = await POST(createRequest({ email: "" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("不正なメール形式で 400 を返す", async () => {
    const response = await POST(createRequest({ email: "not-an-email" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("Resend rate_limit_exceeded で 429 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { name: "rate_limit_exceeded", statusCode: 429, message: "Rate limit exceeded" },
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual({ error: "Too many requests" });
  });

  it("Resend validation_error で 400 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { name: "validation_error", statusCode: 422, message: "Invalid" },
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("Resend その他エラーで 500 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { name: "internal_server_error", statusCode: 500, message: "Server error" },
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });

  it("予期しない例外で 500 を返す", async () => {
    mockContactsCreate.mockRejectedValue(new Error("Network failure"));

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });
});
