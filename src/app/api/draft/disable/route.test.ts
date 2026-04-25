import { describe, it, expect, vi } from "vitest";

const disableMock = vi.fn();
const cookieDeleteMock = vi.fn();

vi.mock("next/headers", () => ({
  draftMode: async () => ({ disable: disableMock }),
  cookies: async () => ({ delete: cookieDeleteMock }),
}));

describe("/api/draft/disable GET", () => {
  it("disable + Cookie 削除 + 200", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(disableMock).toHaveBeenCalled();
    expect(cookieDeleteMock).toHaveBeenCalledWith("microcms_draft_key");
  });
});
