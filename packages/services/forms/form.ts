import { and, asc, db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  createFormInputModel,
  deleteFormInputModel,
  publishFormInputModel,
  setFormAcceptingResponsesInputModel,
  setFormVisibilityInputModel,
  unpublishFormInputModel,
  updateFormInputModel,
  type CreateFormInput,
  type DeleteFormInput,
  type DeleteFormOutput,
  type FormRecord,
  type GetFormByIdInput,
  type GetFormByIdOutput,
  type PublishFormInput,
  type SetFormAcceptingResponsesInput,
  type SetFormVisibilityInput,
  type UnpublishFormInput,
  type UpdateFormInput,
} from "@repo/validators/forms";

import { mapFormFieldRecord, mapFormRecord } from "./mappers";
import { getOwnedFormOrThrow } from "./ownership";
import { ensureUniqueSlug, slugExistsForUser, slugify } from "./slug";

export async function createForm(userId: string, payload: CreateFormInput): Promise<FormRecord> {
  const { title, description, slug: slugInput, themeId } =
    await createFormInputModel.parseAsync(payload);

  const baseSlug = slugify(slugInput ?? title);

  if (slugInput) {
    if (await slugExistsForUser(userId, baseSlug)) {
      throw new Error("A form with this slug already exists for your account");
    }
  }

  const slug = slugInput ? baseSlug : await ensureUniqueSlug(userId, baseSlug);

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

  return mapFormRecord(form);
}

export async function listForms(userId: string): Promise<FormRecord[]> {
  const rows = await db
    .select()
    .from(formsTable)
    .where(eq(formsTable.userId, userId))
    .orderBy(desc(formsTable.createdAt));

  return rows.map((row) => mapFormRecord(row));
}

export async function getFormById(
  userId: string,
  payload: GetFormByIdInput,
): Promise<GetFormByIdOutput> {
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
    form: mapFormRecord(firstRow.form),
    fields: rows
      .filter((row) => row.field !== null)
      .map((row) => mapFormFieldRecord(row.field!)),
  };
}

export async function updateForm(userId: string, payload: UpdateFormInput): Promise<FormRecord> {
  const { formId, title, description, slug: slugInput, themeId, thankYouMessage } =
    await updateFormInputModel.parseAsync(payload);

  if (
    title === undefined &&
    description === undefined &&
    slugInput === undefined &&
    themeId === undefined &&
    thankYouMessage === undefined
  ) {
    throw new Error("At least one field to update is required");
  }

  await getOwnedFormOrThrow(userId, formId);

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
    if (await slugExistsForUser(userId, slug, formId)) {
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

  return mapFormRecord(form);
}

export async function deleteForm(
  userId: string,
  payload: DeleteFormInput,
): Promise<DeleteFormOutput> {
  const { formId } = await deleteFormInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  await db
    .delete(formsTable)
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)));

  return { success: true };
}

export async function publishForm(userId: string, payload: PublishFormInput): Promise<FormRecord> {
  const { formId } = await publishFormInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const updated = await db
    .update(formsTable)
    .set({ status: "published" })
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new Error("Failed to publish form");
  }

  return mapFormRecord(form);
}

export async function unpublishForm(
  userId: string,
  payload: UnpublishFormInput,
): Promise<FormRecord> {
  const { formId } = await unpublishFormInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const updated = await db
    .update(formsTable)
    .set({ status: "draft" })
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new Error("Failed to unpublish form");
  }

  return mapFormRecord(form);
}

export async function setFormVisibility(
  userId: string,
  payload: SetFormVisibilityInput,
): Promise<FormRecord> {
  const { formId, visibility } = await setFormVisibilityInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const updated = await db
    .update(formsTable)
    .set({ visibility })
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new Error("Failed to update form visibility");
  }

  return mapFormRecord(form);
}

export async function setFormAcceptingResponses(
  userId: string,
  payload: SetFormAcceptingResponsesInput,
): Promise<FormRecord> {
  const { formId, acceptingResponses } =
    await setFormAcceptingResponsesInputModel.parseAsync(payload);

  await getOwnedFormOrThrow(userId, formId);

  const updated = await db
    .update(formsTable)
    .set({ closedAt: acceptingResponses ? null : new Date() })
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new Error("Failed to update form response status");
  }

  return mapFormRecord(form);
}
