# Favicon Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate favicon files from `public/logos/mark-neon.png` and place them in `src/app/` for Next.js App Router auto-discovery.

**Architecture:** Use macOS `sips` for PNG resizing and a Node.js script for ICO generation. All favicon files are static assets placed in `src/app/` following Next.js file-based metadata conventions. No `layout.tsx` changes needed.

**Tech Stack:** macOS `sips`, Node.js (ICO binary assembly), Vitest (testing)

---

### Task 1: Generate favicon source images

**Files:**
- Source: `public/logos/mark-neon.png` (1227x749, landscape)
- Create: `src/app/icon.png` (192x192)
- Create: `src/app/apple-icon.png` (180x180)
- Create: `src/app/favicon.ico` (16x16, 32x32, 48x48 multi-size)
- Create (temporary): `scripts/generate-favicons.mjs`

- [ ] **Step 1: Create the favicon generation script**

Create `scripts/generate-favicons.mjs`. This script uses `sips` (macOS built-in) for PNG resizing and manual binary assembly for ICO format:

```javascript
import { execFileSync } from "child_process";
import { copyFileSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "public/logos/mark-neon.png");
const TMP = join(ROOT, "tmp-favicon");
const APP_DIR = join(ROOT, "src/app");

// Clean up tmp dir
if (existsSync(TMP)) rmSync(TMP, { recursive: true });
mkdirSync(TMP, { recursive: true });

// Step 1: Create a 1227x1227 black square canvas by padding the source
const squarePath = join(TMP, "square.png");
copyFileSync(SOURCE, squarePath);
execFileSync("sips", ["-p", "1227", "1227", "--padColor", "000000", squarePath], { stdio: "pipe" });

// Step 2: Generate each PNG size
const sizes = [
  { size: 192, output: join(APP_DIR, "icon.png") },
  { size: 180, output: join(APP_DIR, "apple-icon.png") },
  { size: 48, output: join(TMP, "favicon-48.png") },
  { size: 32, output: join(TMP, "favicon-32.png") },
  { size: 16, output: join(TMP, "favicon-16.png") },
];

for (const { size, output } of sizes) {
  const tmpFile = join(TMP, `tmp-${size}.png`);
  copyFileSync(squarePath, tmpFile);
  execFileSync("sips", ["-z", String(size), String(size), tmpFile], { stdio: "pipe" });
  copyFileSync(tmpFile, output);
}

// Step 3: Assemble ICO from PNG files (ICO = header + directory + PNG data)
function createIco(pngPaths, pngSizes) {
  const pngBuffers = pngPaths.map((p) => readFileSync(p));
  const numImages = pngBuffers.length;

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);          // reserved
  header.writeUInt16LE(1, 2);          // type: 1 = ICO
  header.writeUInt16LE(numImages, 4);  // image count

  // Directory entries: 16 bytes each
  const directory = Buffer.alloc(numImages * 16);
  let dataOffset = 6 + numImages * 16;

  for (let i = 0; i < numImages; i++) {
    const size = pngSizes[i];
    const pngData = pngBuffers[i];
    const off = i * 16;

    directory.writeUInt8(size === 256 ? 0 : size, off);      // width
    directory.writeUInt8(size === 256 ? 0 : size, off + 1);  // height
    directory.writeUInt8(0, off + 2);                         // color palette
    directory.writeUInt8(0, off + 3);                         // reserved
    directory.writeUInt16LE(1, off + 4);                      // color planes
    directory.writeUInt16LE(32, off + 6);                     // bits per pixel
    directory.writeUInt32LE(pngData.length, off + 8);         // image data size
    directory.writeUInt32LE(dataOffset, off + 12);            // image data offset

    dataOffset += pngData.length;
  }

  return Buffer.concat([header, directory, ...pngBuffers]);
}

const icoBuffer = createIco(
  [join(TMP, "favicon-16.png"), join(TMP, "favicon-32.png"), join(TMP, "favicon-48.png")],
  [16, 32, 48]
);
writeFileSync(join(APP_DIR, "favicon.ico"), icoBuffer);

// Cleanup
rmSync(TMP, { recursive: true });

console.log("Favicons generated:");
console.log("  src/app/favicon.ico (16x16, 32x32, 48x48)");
console.log("  src/app/icon.png (192x192)");
console.log("  src/app/apple-icon.png (180x180)");
```

- [ ] **Step 2: Run the generation script**

Run: `node scripts/generate-favicons.mjs`

Expected output:
```
Favicons generated:
  src/app/favicon.ico (16x16, 32x32, 48x48)
  src/app/icon.png (192x192)
  src/app/apple-icon.png (180x180)
```

- [ ] **Step 3: Verify generated files**

Run: `file src/app/favicon.ico src/app/icon.png src/app/apple-icon.png && sips -g pixelWidth -g pixelHeight src/app/icon.png src/app/apple-icon.png`

Expected:
```
src/app/favicon.ico: MS Windows icon resource ...
src/app/icon.png: PNG image data, 192 x 192 ...
src/app/apple-icon.png: PNG image data, 180 x 180 ...
```

- [ ] **Step 4: Delete the generation script**

Run: `rm scripts/generate-favicons.mjs && rmdir scripts 2>/dev/null; true`

- [ ] **Step 5: Commit generated favicon files**

```bash
git add src/app/favicon.ico src/app/icon.png src/app/apple-icon.png
git commit -m "feat: add favicon, icon, and apple-icon from mark-neon logo"
```

---

### Task 2: Write tests for favicon files

**Files:**
- Create: `src/app/favicon.test.ts`

- [ ] **Step 1: Write the test file**

Create `src/app/favicon.test.ts`:

```typescript
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
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(18);
  return { width, height };
}

function parseIcoHeader(buffer: Buffer): {
  count: number;
  entries: Array<{ width: number; height: number }>;
} {
  const reserved = buffer.readUInt16LE(0);
  const type = buffer.readUInt16LE(2);
  const count = buffer.readUInt16LE(4);

  expect(reserved).toBe(0);
  expect(type).toBe(1);

  const entries: Array<{ width: number; height: number }> = [];
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    const width = buffer.readUInt8(offset) || 256;
    const height = buffer.readUInt8(offset + 1) || 256;
    entries.push({ width, height });
  }
  return { count, entries };
}

const APP_DIR = join(__dirname, ".");

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

describe("apple-icon.png", () => {
  it("is a 180x180 PNG", () => {
    const buffer = readFileSync(join(APP_DIR, "apple-icon.png"));
    const { width, height } = getPngDimensions(buffer);

    expect(width).toBe(180);
    expect(height).toBe(180);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/favicon.test.ts`

Expected: PASS (files already exist from Task 1)

- [ ] **Step 3: Run full test suite with coverage**

Run: `npx vitest run --coverage`

Expected: All tests PASS, 100% coverage maintained

- [ ] **Step 4: Commit**

```bash
git add src/app/favicon.test.ts
git commit -m "test: add favicon file validation tests"
```

---

### Task 3: Verify build and lint

- [ ] **Step 1: Run Next.js build**

Run: `npx next build`

Expected: Build succeeds. Next.js auto-discovers favicon files in `src/app/`.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: No errors

- [ ] **Step 3: Commit any fixes (if applicable)**

Only if build or lint revealed issues.
