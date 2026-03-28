import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (buffer[i] !== PNG_SIGNATURE[i]) {
      throw new Error("Not a PNG file");
    }
  }
  // IHDR chunk: width at offset 16, height at offset 20 (both 4-byte big-endian)
  const width =
    (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
  const height =
    (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
  return { width, height };
}

function parseIcoHeader(buffer: Buffer): {
  count: number;
  entries: Array<{ width: number; height: number }>;
} {
  const reserved = buffer[0] | (buffer[1] << 8);
  const type = buffer[2] | (buffer[3] << 8);
  const count = buffer[4] | (buffer[5] << 8);

  if (reserved !== 0 || type !== 1) {
    throw new Error("Not a valid ICO file");
  }

  const entries: Array<{ width: number; height: number }> = [];
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    const width = buffer[offset] || 256;
    const height = buffer[offset + 1] || 256;
    entries.push({ width, height });
  }
  return { count, entries };
}

const APP_DIR = __dirname;

describe("favicon.ico", () => {
  it("is a valid ICO with 16x16, 32x32, 48x48 sizes", () => {
    const buffer = readFileSync(join(APP_DIR, "favicon.ico"));
    const ico = parseIcoHeader(buffer);

    expect(ico.count).toBe(3);
    expect(ico.entries).toContainEqual({ width: 16, height: 16 });
    expect(ico.entries).toContainEqual({ width: 32, height: 32 });
    expect(ico.entries).toContainEqual({ width: 48, height: 48 });
  });
});

describe("icon.png", () => {
  it("is a 192x192 PNG", () => {
    const buffer = readFileSync(join(APP_DIR, "icon.png"));
    const { width, height } = getPngDimensions(buffer);

    expect(width).toBe(192);
    expect(height).toBe(192);
  });
});

describe("icon2.png", () => {
  it("is a 32x32 PNG", () => {
    const buffer = readFileSync(join(APP_DIR, "icon2.png"));
    const { width, height } = getPngDimensions(buffer);

    expect(width).toBe(32);
    expect(height).toBe(32);
  });
});

describe("opengraph-image.png", () => {
  it("is a 1200x630 PNG", () => {
    const buffer = readFileSync(join(APP_DIR, "opengraph-image.png"));
    const { width, height } = getPngDimensions(buffer);

    expect(width).toBe(1200);
    expect(height).toBe(630);
  });
});

describe("apple-icon.png", () => {
  it("is a 180x180 PNG", () => {
    const buffer = readFileSync(join(APP_DIR, "apple-icon.png"));
    const { width, height } = getPngDimensions(buffer);

    expect(width).toBe(180);
    expect(height).toBe(180);
  });
});
