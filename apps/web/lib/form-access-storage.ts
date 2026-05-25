const PREFIX = "holiform-access:";

export function formAccessKey(username: string, slug: string) {
  return `${PREFIX}${username}/${slug}`;
}

export function loadFormAccessPassword(username: string, slug: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(formAccessKey(username, slug));
  } catch {
    return null;
  }
}

export function saveFormAccessPassword(username: string, slug: string, password: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(formAccessKey(username, slug), password);
  } catch {
    // ignore
  }
}

export function clearFormAccessPassword(username: string, slug: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(formAccessKey(username, slug));
  } catch {
    // ignore
  }
}
