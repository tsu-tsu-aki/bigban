export function isCmsNewsEnabled(): boolean {
  return process.env.USE_CMS_NEWS === "true";
}
