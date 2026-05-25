const PREFIX = "holiform-draft:";

export type FormDraft = {
  answers: Record<string, unknown>;
  stepIndex: number;
  savedAt: number;
};

export function formDraftKey(username: string, slug: string) {
  return `${PREFIX}${username}/${slug}`;
}

export function loadFormDraft(key: string): FormDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as FormDraft;
    if (!parsed || typeof parsed.stepIndex !== "number" || !parsed.answers) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveFormDraft(key: string, draft: FormDraft) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Storage full or disabled — ignore
  }
}

export function clearFormDraft(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
