import { and, asc, db, desc, eq, ne } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  closeFormInputModel,
  createFormInputModel,
  deleteFormFieldInputModel,
  deleteFormInputModel,
  publishFormInputModel,
  reopenFormInputModel,
  reorderFormFieldInputModel,
  setFormVisibilityInputModel,
  unpublishFormInputModel,
  updateFormInputModel,
  upsertFormFieldInputModel,
  type CloseFormInput,
  type CreateFormInput,
  type DeleteFormFieldInput,
  type DeleteFormFieldOutput,
  type DeleteFormInput,
  type DeleteFormOutput,
  type FormFieldRecord,
  type FormRecord,
  type GetFormByIdInput,
  type GetFormByIdOutput,
  type PublishFormInput,
  type ReopenFormInput,
  type ReorderFormFieldInput,
  type SetFormVisibilityInput,
  type UnpublishFormInput,
  type UpdateFormInput,
  type UpsertFormFieldInput,
} from "@repo/validators/forms";

export { buildSubmissionSchemaFromFields } from "./buildSubmissionSchema";

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
  private async slugExistsForUser(
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

  private async labelKeyExistsOnForm(
    formId: string,
    labelKey: string,
    excludeFieldId?: string,
  ) {
    const conditions = [
      eq(formFieldsTable.formId, formId),
      eq(formFieldsTable.labelKey, labelKey),
    ];
    if (excludeFieldId) {
      conditions.push(ne(formFieldsTable.id, excludeFieldId));
    }

    const rows = await db
      .select({ id: formFieldsTable.id })
      .from(formFieldsTable)
      .where(and(...conditions));

    return rows.length > 0;
  }

  private async getNextFieldIndex(formId: string) {
    const rows = await db
      .select({ index: formFieldsTable.index })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(desc(formFieldsTable.index))
      .limit(1);

    const last = rows[0];
    if (!last) {
      return "1000";
    }

    return String(Number(last.index) + 1000);
  }

  private async getOwnedFieldOrThrow(userId: string, formId: string, fieldId: string) {
    await this.getOwnedFormOrThrow(userId, formId);

    const rows = await db
      .select()
      .from(formFieldsTable)
      .where(
        and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)),
      );

    const field = rows[0];
    if (!field) {
      throw new Error("Form field not found");
    }

    return field;
  }

  private async getOwnedFormOrThrow(userId: string, formId: string) {
    const rows = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)));

    const form = rows[0];
    if (!form) {
      throw new Error("Form not found");
    }

    return form;
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

  public async updateForm(userId: string, payload: UpdateFormInput): Promise<FormRecord> {
    const { formId, title, description, slug: slugInput, themeId, thankYouMessage } =
      await updateFormInputModel.parseAsync(payload);

    await this.getOwnedFormOrThrow(userId, formId);

    const updates: Partial<typeof formsTable.$inferInsert> = {};

    if (title !== undefined) {
      updates.title = title;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (thankYouMessage !== undefined) {
      updates.thankYouMessage = thankYouMessage;
    }
    if (themeId !== undefined) {
      updates.themeId = themeId;
    }
    if (slugInput !== undefined) {
      const slug = slugify(slugInput);
      if (await this.slugExistsForUser(userId, slug, formId)) {
        throw new Error("A form with this slug already exists for your account");
      }
      updates.slug = slug;
    }

    const updated = await db
      .update(formsTable)
      .set(updates)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .returning();

    const form = updated[0];
    if (!form) {
      throw new Error("Failed to update form");
    }

    return this.mapFormRecord(form);
  }

  public async deleteForm(userId: string, payload: DeleteFormInput): Promise<DeleteFormOutput> {
    const { formId } = await deleteFormInputModel.parseAsync(payload);
    await this.getOwnedFormOrThrow(userId, formId);

    await db
      .delete(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)));

    return { success: true };
  }

  public async publishForm(userId: string, payload: PublishFormInput): Promise<FormRecord> {
    const { formId } = await publishFormInputModel.parseAsync(payload);
    await this.getOwnedFormOrThrow(userId, formId);

    const updated = await db
      .update(formsTable)
      .set({ status: "published" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .returning();

    const form = updated[0];
    if (!form) {
      throw new Error("Failed to publish form");
    }

    return this.mapFormRecord(form);
  }

  public async unpublishForm(userId: string, payload: UnpublishFormInput): Promise<FormRecord> {
    const { formId } = await unpublishFormInputModel.parseAsync(payload);
    await this.getOwnedFormOrThrow(userId, formId);

    const updated = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .returning();

    const form = updated[0];
    if (!form) {
      throw new Error("Failed to unpublish form");
    }

    return this.mapFormRecord(form);
  }

  public async setFormVisibility(
    userId: string,
    payload: SetFormVisibilityInput,
  ): Promise<FormRecord> {
    const { formId, visibility } = await setFormVisibilityInputModel.parseAsync(payload);
    await this.getOwnedFormOrThrow(userId, formId);

    const updated = await db
      .update(formsTable)
      .set({ visibility })
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .returning();

    const form = updated[0];
    if (!form) {
      throw new Error("Failed to update form visibility");
    }

    return this.mapFormRecord(form);
  }

  public async closeForm(userId: string, payload: CloseFormInput): Promise<FormRecord> {
    const { formId } = await closeFormInputModel.parseAsync(payload);
    await this.getOwnedFormOrThrow(userId, formId);

    const updated = await db
      .update(formsTable)
      .set({ closedAt: new Date() })
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .returning();

    const form = updated[0];
    if (!form) {
      throw new Error("Failed to close form");
    }

    return this.mapFormRecord(form);
  }

  public async reopenForm(userId: string, payload: ReopenFormInput): Promise<FormRecord> {
    const { formId } = await reopenFormInputModel.parseAsync(payload);
    await this.getOwnedFormOrThrow(userId, formId);

    const updated = await db
      .update(formsTable)
      .set({ closedAt: null })
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .returning();

    const form = updated[0];
    if (!form) {
      throw new Error("Failed to reopen form");
    }

    return this.mapFormRecord(form);
  }

  public async upsertFormField(
    userId: string,
    payload: UpsertFormFieldInput,
  ): Promise<FormFieldRecord> {
    const parsed = await upsertFormFieldInputModel.parseAsync(payload);
    const {
      formId,
      fieldId,
      label,
      labelKey,
      type,
      index,
      isRequired,
      description,
      placeholder,
      options,
      validationRules,
    } = parsed;

    await this.getOwnedFormOrThrow(userId, formId);

    if (await this.labelKeyExistsOnForm(formId, labelKey, fieldId)) {
      throw new Error("A field with this label key already exists on this form");
    }

    const fieldIndex = index ?? (await this.getNextFieldIndex(formId));

    if (fieldId) {
      const updated = await db
        .update(formFieldsTable)
        .set({
          label,
          labelKey,
          type,
          index: fieldIndex,
          isRequired: isRequired ?? false,
          description: description ?? null,
          placeholder: placeholder ?? null,
          options: options ?? null,
          validationRules: validationRules ?? null,
        })
        .where(
          and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)),
        )
        .returning();

      const field = updated[0];
      if (!field) {
        throw new Error("Form field not found");
      }

      return this.mapFormFieldRecord(field);
    }

    const inserted = await db
      .insert(formFieldsTable)
      .values({
        formId,
        label,
        labelKey,
        type,
        index: fieldIndex,
        isRequired: isRequired ?? false,
        description: description ?? null,
        placeholder: placeholder ?? null,
        options: options ?? null,
        validationRules: validationRules ?? null,
      })
      .returning();

    const field = inserted[0];
    if (!field) {
      throw new Error("Failed to create form field");
    }

    return this.mapFormFieldRecord(field);
  }

  public async deleteFormField(
    userId: string,
    payload: DeleteFormFieldInput,
  ): Promise<DeleteFormFieldOutput> {
    const { formId, fieldId } = await deleteFormFieldInputModel.parseAsync(payload);
    await this.getOwnedFieldOrThrow(userId, formId, fieldId);

    await db
      .delete(formFieldsTable)
      .where(
        and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)),
      );

    return { success: true };
  }

  public async reorderFormField(
    userId: string,
    payload: ReorderFormFieldInput,
  ): Promise<FormFieldRecord> {
    const { formId, fieldId, index } = await reorderFormFieldInputModel.parseAsync(payload);
    await this.getOwnedFieldOrThrow(userId, formId, fieldId);

    const updated = await db
      .update(formFieldsTable)
      .set({ index })
      .where(
        and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)),
      )
      .returning();

    const field = updated[0];
    if (!field) {
      throw new Error("Form field not found");
    }

    return this.mapFormFieldRecord(field);
  }
}

export default FormService;
