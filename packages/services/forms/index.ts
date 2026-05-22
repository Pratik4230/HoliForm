import { and, asc, db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  createFormInputModel,
  type CreateFormInput,
  type FormFieldRecord,
  type FormRecord,
  type GetFormByIdInput,
  type GetFormByIdOutput,
} from "@repo/validators/forms";

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

  private mapFormFieldRecord(row: typeof formFieldsTable.$inferSelect): FormFieldRecord {
    return {
      id: row.id,
      formId: row.formId,
      label: row.label,
      labelKey: row.labelKey,
      description: row.description ?? null,
      placeholder: row.placeholder ?? null,
      isRequired: row.isRequired,
      index: String(row.index),
      type: row.type,
      options: row.options ?? null,
      validationRules: row.validationRules ?? null,
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    };
  }

  private mapFormRecord(row: typeof formsTable.$inferSelect): FormRecord {
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

  public async createForm(userId: string, payload: CreateFormInput): Promise<FormRecord> {
    const { title, description, slug: slugInput, themeId } =
      await createFormInputModel.parseAsync(payload);

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

  public async listForms(userId: string): Promise<FormRecord[]> {
    const rows = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.userId, userId))
      .orderBy(desc(formsTable.createdAt));

    return rows.map((row) => this.mapFormRecord(row));
  }

  public async getFormById(userId: string, payload: GetFormByIdInput): Promise<GetFormByIdOutput> {
    const { formId } = payload;

    const rows = await db
      .select({
        form: formsTable,
        field: formFieldsTable,
      })
      .from(formsTable)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .orderBy(asc(formFieldsTable.index));

    const firstRow = rows[0];
    if (!firstRow) {
      throw new Error("Form not found");
    }

    return {
      form: this.mapFormRecord(firstRow.form),
      fields: rows
        .filter((row) => row.field !== null)
        .map((row) => this.mapFormFieldRecord(row.field!)),
    };
  }
}

export default FormService;
