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
];

const ALLOWED_URI_REGEXP = /^(?:https:|mailto:|tel:|#)/;

const STRICT_ALLOWED_CLASSES = new Set(["lead", "caption"]);

export const STRICT_HTML_CONFIG = {
  ALLOWED_TAGS: [
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
  ],
  ALLOWED_ATTR: COMMON_ALLOWED_ATTR,
  ALLOWED_URI_REGEXP,
  FORBID_TAGS: COMMON_FORBID_TAGS,
  FORBID_ATTR: COMMON_FORBID_ATTR,
};

export const RICH_EDITOR_CONFIG = {
  ALLOWED_ATTR: COMMON_ALLOWED_ATTR,
  ALLOWED_URI_REGEXP,
  FORBID_TAGS: COMMON_FORBID_TAGS,
  FORBID_ATTR: COMMON_FORBID_ATTR,
};

DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName === "src" && (node as Element).tagName === "IMG") {
    try {
      const u = new URL(data.attrValue);
      if (u.hostname !== ALLOWED_IMG_HOST) {
        data.keepAttr = false;
      }
    } catch {
      data.keepAttr = false;
    }
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

  if (config === STRICT_HTML_CONFIG) {
    result = filterClasses(result, STRICT_ALLOWED_CLASSES);
  }

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
