export function getPublicFormUrl(username: string, slug: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/f/${username}/${slug}`;
  }
  return `/f/${username}/${slug}`;
}
