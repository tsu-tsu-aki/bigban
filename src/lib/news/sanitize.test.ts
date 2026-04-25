import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeNewsHtml,
  STRICT_HTML_CONFIG,
  RICH_EDITOR_CONFIG,
} from "./sanitize";

describe("sanitizeNewsHtml — 共通", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("script/iframe/style/base/link/form タグを除去", () => {
    const input = `
      <p>ok</p>
      <script>alert(1)</script>
      <iframe src="x"></iframe>
      <style>body{}</style>
      <base href="/">
      <link rel="stylesheet" href="x">
      <form action="x"><input></form>
    `;
    const out = sanitizeNewsHtml(input, STRICT_HTML_CONFIG);
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<style/i);
    expect(out).not.toMatch(/<base/i);
    expect(out).not.toMatch(/<link/i);
    expect(out).not.toMatch(/<form/i);
    expect(out).toMatch(/<p>ok<\/p>/);
  });

  it("style属性 / on*属性 を除去", () => {
    const input = `<p style="color:red" onclick="bad()">ok</p>`;
    const out = sanitizeNewsHtml(input, STRICT_HTML_CONFIG);
    expect(out).not.toMatch(/style=/i);
    expect(out).not.toMatch(/onclick=/i);
  });

  it("javascript:/data: スキームの a@href を除去", () => {
    const input = `<a href="javascript:alert(1)">x</a><a href="data:text/html,<x>">y</a>`;
    const out = sanitizeNewsHtml(input, STRICT_HTML_CONFIG);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).not.toMatch(/data:/i);
  });

  it("a に target=_blank / rel=noopener noreferrer 自動付与", () => {
    const out = sanitizeNewsHtml(
      `<a href="https://example.com">x</a>`,
      STRICT_HTML_CONFIG,
    );
    expect(out).toMatch(/target="_blank"/);
    expect(out).toMatch(/rel="noopener noreferrer"/);
  });

  it("img の許可外ホストは src 除去", () => {
    const out = sanitizeNewsHtml(
      `<img src="https://evil.example.com/x.jpg" alt="x">`,
      STRICT_HTML_CONFIG,
    );
    expect(out).not.toMatch(/src="https:\/\/evil/);
  });

  it("img の許可ホスト (images.microcms-assets.io) は src 保持", () => {
    const out = sanitizeNewsHtml(
      `<img src="https://images.microcms-assets.io/a.jpg" alt="x" width="10" height="10">`,
      STRICT_HTML_CONFIG,
    );
    expect(out).toMatch(/src="https:\/\/images\.microcms-assets\.io\/a\.jpg"/);
  });

  it("img width/height欠如時にデフォルト適用 + console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const out = sanitizeNewsHtml(
      `<img src="https://images.microcms-assets.io/x.jpg" alt="x">`,
      STRICT_HTML_CONFIG,
    );
    expect(out).toMatch(/width="1200"/);
    expect(out).toMatch(/height="675"/);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("img に loading=lazy / decoding=async が自動付与される", () => {
    const out = sanitizeNewsHtml(
      `<img src="https://images.microcms-assets.io/a.jpg" alt="x" width="10" height="10">`,
      STRICT_HTML_CONFIG,
    );
    expect(out).toMatch(/loading="lazy"/);
    expect(out).toMatch(/decoding="async"/);
  });

  it("isFirstImageLcp=true で先頭 img に fetchpriority=high + loading=eager", () => {
    const out = sanitizeNewsHtml(
      `<p>x</p><img src="https://images.microcms-assets.io/a.jpg" alt="x" width="10" height="10"><img src="https://images.microcms-assets.io/b.jpg" alt="y" width="10" height="10">`,
      STRICT_HTML_CONFIG,
      { isFirstImageLcp: true },
    );
    const firstImg = out.match(/<img[^>]*a\.jpg[^>]*>/);
    expect(firstImg).not.toBeNull();
    expect(firstImg?.[0]).toMatch(/fetchpriority="high"/);
    expect(firstImg?.[0]).toMatch(/loading="eager"/);
    const secondImg = out.match(/<img[^>]*b\.jpg[^>]*>/);
    expect(secondImg?.[0]).toMatch(/loading="lazy"/);
  });
});

describe("STRICT_HTML_CONFIG", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("許可タグ以外 (h1/section/div) を除去", () => {
    const out = sanitizeNewsHtml(
      `<h1>title</h1><section>x</section><div>y</div><p>ok</p>`,
      STRICT_HTML_CONFIG,
    );
    expect(out).not.toMatch(/<h1/);
    expect(out).not.toMatch(/<section/);
    expect(out).not.toMatch(/<div/);
    expect(out).toMatch(/<p>ok<\/p>/);
  });

  it("許可クラス以外 (text-red-500) を除去、lead/caption は保持", () => {
    const out = sanitizeNewsHtml(
      `<p class="lead text-red-500">x</p><p class="caption">y</p>`,
      STRICT_HTML_CONFIG,
    );
    expect(out).toMatch(/class="lead"/);
    expect(out).not.toMatch(/text-red-500/);
    expect(out).toMatch(/class="caption"/);
  });
});

describe("RICH_EDITOR_CONFIG", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("リッチエディタ系タグ (h1/section) も保持", () => {
    const out = sanitizeNewsHtml(
      `<h1>title</h1><h2>sub</h2><p>ok</p>`,
      RICH_EDITOR_CONFIG,
    );
    expect(out).toMatch(/<h1/);
    expect(out).toMatch(/<h2/);
    expect(out).toMatch(/<p>ok<\/p>/);
  });

  it("カスタムクラス lead/caption を保持", () => {
    const out = sanitizeNewsHtml(
      `<p class="lead">x</p><p class="caption">y</p>`,
      RICH_EDITOR_CONFIG,
    );
    expect(out).toMatch(/class="lead"/);
    expect(out).toMatch(/class="caption"/);
  });
});
