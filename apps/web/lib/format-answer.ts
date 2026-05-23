export function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatAnswerValue(item)).join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  const text = String(value);
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}
