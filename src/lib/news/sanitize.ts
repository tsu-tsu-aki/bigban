import DOMPurify from "isomorphic-dompurify";

if (!DOMPurify.isSupported) {
  throw new Error(
    "[news/sanitize] DOMPurify JSDOM binding failed; sanitization would silently bypass",
  );
}

const ALLOWED_IMG_HOST = "images.microcms-assets.io";

const COMMON_FORBID_TAGS = [
  "script",
  "iframe",
  "style",
  "base",
  "link",
  "object",
  "embed",
  "form",
];
const COMMON_FORBID_ATTR = [
  "style",
  "formaction",
  "onclick",
  "onload",
  "onerror",
];

const COMMON_ALLOWED_ATTR = [
  "href",
  "title",
  "class",
  "src",
  "alt",
  "width",
  "height",
  "cite",
  "target",
  "rel",
  "loading",
  "decoding",
  "fetchpriority",
  // table 系
  "scope",
  "colspan",
  "rowspan",
  // a11y 系 (table scroll wrapper 等)
  "tabindex",
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
];

// 注: ALLOWED_URI_REGEXP オプションは DOMPurify 3.x + jsdom env で
// 関係ない属性 (scope/colspan 等) を巻き込んで削除するバグ的挙動があるため使わず、
// 下記 ALLOWED_HREF_PROTOCOLS でフック内検証する。
const ALLOWED_HREF_PROTOCOLS = /^(?:https:|mailto:|tel:|#)/;

// STRICT/RICH 共通の許可クラス。HTMLモード/リッチエディタモードどちらでも
// 同じ class allowlist を適用する (RICH の class 任意通過は HIGH リスクのため)。
const ALLOWED_CLASSES = new Set([
  "lead",
  "caption",
  "badge",
  "highlight",
  "note",
  "caution",
  "news-table-scroll",
]);

// 共通の許可タグ (block / inline / table / 注釈)
const COMMON_ALLOWED_TAGS = [
  "h2",
  "h3",
  "h4",
  "p",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "strong",
  "em",
  "code",
  "pre",
  "figure",
  "figcaption",
  "br",
  "hr",
  // table
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  // inline / block 拡張
  "span",
  "aside",
  "mark",
];

export const STRICT_HTML_CONFIG = {
  ALLOWED_TAGS: COMMON_ALLOWED_TAGS,
  ALLOWED_ATTR: COMMON_ALLOWED_ATTR,
  FORBID_TAGS: COMMON_FORBID_TAGS,
  FORBID_ATTR: COMMON_FORBID_ATTR,
};

// RICH_EDITOR_CONFIG も明示的に ALLOWED_TAGS を指定し、デフォルトの
// ~80 タグ (svg/math/details/video/audio 等) を除外する。
// Sec レビュー HIGH 指摘対応: 暗黙の許可タグによるクリックジャック等を防止。
export const RICH_EDITOR_CONFIG = {
  ALLOWED_TAGS: COMMON_ALLOWED_TAGS,
  ALLOWED_ATTR: COMMON_ALLOWED_ATTR,
  FORBID_TAGS: COMMON_FORBID_TAGS,
  FORBID_ATTR: COMMON_FORBID_ATTR,
};

const VALID_SCOPE_VALUES = new Set(["row", "col", "rowgroup", "colgroup"]);
const SPAN_REGEX = /^[1-9]\d?$/;

DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  const tag = (node as Element).tagName;

  // <img src> はホスト制限
  if (data.attrName === "src" && tag === "IMG") {
    try {
      const u = new URL(data.attrValue);
      if (u.hostname !== ALLOWED_IMG_HOST) {
        data.keepAttr = false;
      }
    } catch {
      data.keepAttr = false;
    }
    return;
  }

  // <a href> は protocol allowlist 検証
  if (data.attrName === "href" && tag === "A") {
    if (!ALLOWED_HREF_PROTOCOLS.test(data.attrValue)) {
      data.keepAttr = false;
    }
    return;
  }

  // <th scope=...> は enum 検証
  if (data.attrName === "scope") {
    if (!VALID_SCOPE_VALUES.has(data.attrValue)) {
      data.keepAttr = false;
    }
    return;
  }

  // <td/th colspan|rowspan> は 1-99 のみ (DoS 対策)
  if (data.attrName === "colspan" || data.attrName === "rowspan") {
    if (!SPAN_REGEX.test(data.attrValue)) {
      data.keepAttr = false;
    }
    return;
  }
});

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  const el = node as Element;
  if (el.tagName === "A" && el.hasAttribute("href")) {
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  }
  if (el.tagName === "IMG") {
    if (!el.hasAttribute("width") || !el.hasAttribute("height")) {
      el.setAttribute("width", "1200");
      el.setAttribute("height", "675");
      console.warn(
        "[news/sanitize] <img> missing width/height; default 1200x675 applied",
      );
    }
    if (!el.hasAttribute("loading")) el.setAttribute("loading", "lazy");
    if (!el.hasAttribute("decoding")) el.setAttribute("decoding", "async");
  }
});

function filterClasses(html: string, allowed: Set<string>): string {
  return html.replace(/\sclass="([^"]*)"/g, (_match, classes: string) => {
    const filtered = classes
      .split(/\s+/)
      .filter((c) => c.length > 0 && allowed.has(c));
    if (filtered.length === 0) return "";
    return ` class="${filtered.join(" ")}"`;
  });
}

export interface SanitizeOptions {
  isFirstImageLcp?: boolean;
}

export function sanitizeNewsHtml(
  html: string,
  config: typeof STRICT_HTML_CONFIG | typeof RICH_EDITOR_CONFIG,
  options: SanitizeOptions = {},
): string {
  let result = DOMPurify.sanitize(html, config) as unknown as string;

  // class allowlist は STRICT / RICH 両モード共通で適用
  // (RICH モードで任意の class が通ると Tailwind ユーティリティでの
  //  clickjacking 等が可能なため)
  result = filterClasses(result, ALLOWED_CLASSES);

  if (options.isFirstImageLcp) {
    result = result.replace(/<img([^>]*?)>/, (match, attrs: string) => {
      if (/loading="eager"/.test(attrs)) return match;
      const stripped = attrs
        .replace(/\sloading="[^"]*"/, "")
        .replace(/\sdecoding="[^"]*"/, "");
      return `<img${stripped} fetchpriority="high" loading="eager" decoding="async">`;
    });
  }
  return result;
}
