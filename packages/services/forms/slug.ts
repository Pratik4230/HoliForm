import { and, db, eq, ne } from "@repo/database";
import { formsTable } from "@repo/database/models/form";

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);

  return slug.length > 0 ? slug : "untitled-form";
}

export async function slugExistsForUser(
  userId: string,
  slug: string,
  excludeFormId?: string,
) {
  const conditions = [eq(formsTable.userId, userId), eq(formsTable.slug, slug)];
  if (excludeFormId) {
    conditions.push(ne(formsTable.id, excludeFormId));
  }

  const rows = await db
    .select({ id: formsTable.id })
    .from(formsTable)
    .where(and(...conditions));

  return rows.length > 0;
}

export async function ensureUniqueSlug(userId: string, baseSlug: string) {
  let slug = baseSlug;
  let counter = 2;

  while (await slugExistsForUser(userId, slug)) {
    const suffix = `-${counter}`;
    slug = `${baseSlug.slice(0, 128 - suffix.length)}${suffix}`;
    counter += 1;
  }

  return slug;
}
