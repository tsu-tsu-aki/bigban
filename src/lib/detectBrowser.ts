const IOS_DEVICE_RE = /iPhone|iPad|iPod/i;
const OTHER_IOS_BROWSER_RE = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo|GSA/i;

export function isIOSSafari(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  if (!IOS_DEVICE_RE.test(userAgent)) return false;
  if (!/Safari\//.test(userAgent)) return false;
  if (OTHER_IOS_BROWSER_RE.test(userAgent)) return false;
  return true;
}
