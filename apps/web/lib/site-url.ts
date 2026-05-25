/** Absolute site URL for OG tags and canonical links (no trailing slash). */
export function getSiteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.WEB_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return (fromEnv ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getPublicFormPath(username: string, slug: string) {
  return `/f/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
}

export function getPublicFormAbsoluteUrl(username: string, slug: string) {
  return `${getSiteUrl()}${getPublicFormPath(username, slug)}`;
}
