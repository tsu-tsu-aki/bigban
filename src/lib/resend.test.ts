import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("resend", () => ({
  Resend: vi.fn(),
}));

import { Resend } from "resend";
import { createResendClient } from "./resend";

describe("createResendClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(Resend).mockClear();
  });

  it("RESEND_API_KEY が設定されている場合 Resend インスタンスを返す", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_123");

    const client = createResendClient();

    expect(Resend).toHaveBeenCalledWith("re_test_123");
    expect(client).toBeInstanceOf(Resend);
  });

  it("RESEND_API_KEY が未設定の場合エラーを投げる", () => {
    vi.stubEnv("RESEND_API_KEY", "");

    expect(() => createResendClient()).toThrow(
      "RESEND_API_KEY environment variable is not set"
    );
  });

  it("RESEND_API_KEY が undefined の場合エラーを投げる", () => {
    delete process.env.RESEND_API_KEY;

    expect(() => createResendClient()).toThrow(
      "RESEND_API_KEY environment variable is not set"
    );
  });
});
