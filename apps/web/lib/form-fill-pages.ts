type FieldWithPage = {
  pageIndex: number;
  index: string;
};

/** Each step is one or more fields shown together (section vs single-question wizard). */
export function buildFormSteps<T extends FieldWithPage>(fields: T[]): T[][] {
  if (fields.length === 0) {
    return [];
  }

  const sorted = [...fields].sort((a, b) => Number(a.index) - Number(b.index));
  const hasMultiplePages = sorted.some((field) => field.pageIndex > 0);

  if (!hasMultiplePages) {
    return sorted.map((field) => [field]);
  }

  const pageIndices = [...new Set(sorted.map((field) => field.pageIndex))].sort(
    (a, b) => a - b,
  );

  return pageIndices
    .map((pageIndex) => sorted.filter((field) => field.pageIndex === pageIndex))
    .filter((pageFields) => pageFields.length > 0);
}

export function formHasMultipleSections(fields: FieldWithPage[]) {
  return fields.some((field) => field.pageIndex > 0);
}
