/** Fractional index between two neighbors (for drag reorder). */
export function computeFractionalIndex(before?: string, after?: string): string {
  const beforeNum = before != null ? Number(before) : null;
  const afterNum = after != null ? Number(after) : null;

  if (beforeNum == null && afterNum != null) {
    return String(afterNum - 1000);
  }
  if (beforeNum != null && afterNum == null) {
    return String(beforeNum + 1000);
  }
  if (beforeNum != null && afterNum != null) {
    return String((beforeNum + afterNum) / 2);
  }
  return "1000";
}
