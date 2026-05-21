import { and, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { createFormInput, type CreateFormInput, type FormRecordOutput } from "./model";

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);

  return slug.length > 0 ? slug : "untitled-form";
}

class FormService {
  private async slugExistsForUser(userId: string, slug: string) {
    const rows = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.userId, userId), eq(formsTable.slug, slug)));

    return rows.length > 0;
  }

  private async ensureUniqueSlug(userId: string, baseSlug: string) {
    let slug = baseSlug;
    let counter = 2;

    while (await this.slugExistsForUser(userId, slug)) {
      const suffix = `-${counter}`;
      slug = `${baseSlug.slice(0, 128 - suffix.length)}${suffix}`;
      counter += 1;
    }

    return slug;
  }

  private mapFormRecord(row: typeof formsTable.$inferSelect): FormRecordOutput {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description,
      slug: row.slug,
      status: row.status,
      visibility: row.visibility,
      themeId: row.themeId ?? null,
      thankYouMessage: row.thankYouMessage ?? null,
      closedAt: row.closedAt ?? null,
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    };
  }

  public async createForm(userId: string, payload: CreateFormInput): Promise<FormRecordOutput> {
    const { title, description, slug: slugInput, themeId } =
      await createFormInput.parseAsync(payload);

    const baseSlug = slugify(slugInput ?? title);

    if (slugInput) {
      if (await this.slugExistsForUser(userId, baseSlug)) {
        throw new Error("A form with this slug already exists for your account");
      }
    }

    const slug = slugInput ? baseSlug : await this.ensureUniqueSlug(userId, baseSlug);

    const inserted = await db
      .insert(formsTable)
      .values({
        userId,
        title,
        description,
        slug,
        themeId: themeId ?? null,
      })
      .returning();

    const form = inserted[0];
    if (!form) {
      throw new Error("Failed to create form");
    }

    return this.mapFormRecord(form);
  }
}

export default FormService;
