import { and, asc, db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  createFormInputModel,
  cloneFormInputModel,
  deleteFormInputModel,
  publishFormInputModel,
  setFormAcceptingResponsesInputModel,
  setFormVisibilityInputModel,
  unpublishFormInputModel,
  updateFormInputModel,
  type CreateFormInput,
  archiveFormInputModel,
  unarchiveFormInputModel,
  type ArchiveFormInput,
  type CloneFormInput,
  type DeleteFormInput,
  type DeleteFormOutput,
  type FormRecord,
  type GetFormByIdInput,
  type GetFormByIdOutput,
  type PublishFormInput,
  type SetFormAcceptingResponsesInput,
  type SetFormVisibilityInput,
  type UnarchiveFormInput,
  type UnpublishFormInput,
  type UpdateFormInput,
} from "@repo/validators/forms";

import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { AppServiceError } from "../errors";
import { createFormAccessPasswordCredentials } from "./accessPassword";
import { mapFormFieldRecord, mapFormRecord } from "./mappers";
import { getOwnedFormOrThrow } from "./ownership";
import { ensureUniqueSlug, slugExistsForUser, slugify } from "./slug";
import { DEFAULT_FORM_THEME_ID, isValidThemeId } from "./themePresets";

function assertValidThemeId(themeId: string) {
  if (!isValidThemeId(themeId)) {
    throw new AppServiceError("Unknown theme preset", API_ERROR_CODES.VALIDATION_ERROR);
  }
}

export async function createForm(userId: string, payload: CreateFormInput): Promise<FormRecord> {
  const { title, description, slug: slugInput, themeId } =
    await createFormInputModel.parseAsync(payload);

  const baseSlug = slugify(slugInput ?? title);

  if (slugInput) {
    if (await slugExistsForUser(userId, baseSlug)) {
      throw new AppServiceError(
        "A form with this slug already exists for your account",
        API_ERROR_CODES.FORM_SLUG_CONFLICT,
      );
    }
  }

  const slug = slugInput ? baseSlug : await ensureUniqueSlug(userId, baseSlug);
  const resolvedThemeId = themeId ?? DEFAULT_FORM_THEME_ID;
  assertValidThemeId(resolvedThemeId);

  const inserted = await db
    .insert(formsTable)
    .values({
      userId,
      title,
      description,
      slug,
      themeId: resolvedThemeId,
    })
    .returning();

  const form = inserted[0];
  if (!form) {
    throw new AppServiceError("Failed to create form", API_ERROR_CODES.INTERNAL_ERROR);
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
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  return {
    form: mapFormRecord(firstRow.form),
    fields: rows
      .filter((row) => row.field !== null)
      .map((row) => mapFormFieldRecord(row.field!)),
  };
}

export async function updateForm(userId: string, payload: UpdateFormInput): Promise<FormRecord> {
  const {
    formId,
    title,
    description,
    slug: slugInput,
    themeId,
    thankYouMessage,
    expiresAt,
    maxResponses,
    accessPassword,
  } = await updateFormInputModel.parseAsync(payload);

  if (
    title === undefined &&
    description === undefined &&
    slugInput === undefined &&
    themeId === undefined &&
    thankYouMessage === undefined &&
    expiresAt === undefined &&
    maxResponses === undefined &&
    accessPassword === undefined
  ) {
    throw new AppServiceError(
      "At least one field to update is required",
      API_ERROR_CODES.UPDATE_REQUIRES_FIELDS,
    );
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
    if (themeId !== null) {
      assertValidThemeId(themeId);
    }
    updates.themeId = themeId;
  }
  if (slugInput !== undefined) {
    const slug = slugify(slugInput);
    if (await slugExistsForUser(userId, slug, formId)) {
      throw new AppServiceError(
        "A form with this slug already exists for your account",
        API_ERROR_CODES.FORM_SLUG_CONFLICT,
      );
    }
    updates.slug = slug;
  }
  if (expiresAt !== undefined) {
    updates.expiresAt = expiresAt;
  }
  if (maxResponses !== undefined) {
    updates.maxResponses = maxResponses;
  }
  if (accessPassword !== undefined) {
    if (accessPassword === null) {
      updates.accessPasswordSalt = null;
      updates.accessPasswordHash = null;
    } else {
      const credentials = createFormAccessPasswordCredentials(accessPassword);
      updates.accessPasswordSalt = credentials.salt;
      updates.accessPasswordHash = credentials.hash;
    }
  }

  const updated = await db
    .update(formsTable)
    .set(updates)
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new AppServiceError("Failed to update form", API_ERROR_CODES.INTERNAL_ERROR);
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

function buildCloneTitle(title: string) {
  const copyTitle = `Copy of ${title}`;
  return copyTitle.length <= 255 ? copyTitle : `${copyTitle.slice(0, 252)}...`;
}

export async function cloneForm(userId: string, payload: CloneFormInput): Promise<FormRecord> {
  const { formId } = await cloneFormInputModel.parseAsync(payload);
  const source = await getOwnedFormOrThrow(userId, formId);

  const fieldRows = await db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(asc(formFieldsTable.index));

  const slug = await ensureUniqueSlug(userId, slugify(`${source.slug}-copy`));
  const title = buildCloneTitle(source.title);

  if (source.themeId) {
    assertValidThemeId(source.themeId);
  }

  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(formsTable)
      .values({
        userId,
        title,
        description: source.description,
        slug,
        themeId: source.themeId,
        thankYouMessage: source.thankYouMessage,
      })
      .returning();

    const form = inserted[0];
    if (!form) {
      throw new AppServiceError("Failed to clone form", API_ERROR_CODES.INTERNAL_ERROR);
    }

    if (fieldRows.length > 0) {
      await tx.insert(formFieldsTable).values(
        fieldRows.map((field) => ({
          formId: form.id,
          label: field.label,
          labelKey: field.labelKey,
          description: field.description,
          placeholder: field.placeholder,
          isRequired: field.isRequired,
          index: field.index,
          pageIndex: field.pageIndex,
          type: field.type,
          options: field.options,
          validationRules: field.validationRules,
        })),
      );
    }

    return mapFormRecord(form);
  });
}

export async function archiveForm(userId: string, payload: ArchiveFormInput): Promise<FormRecord> {
  const { formId } = await archiveFormInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const updated = await db
    .update(formsTable)
    .set({ archivedAt: new Date(), status: "draft" })
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new AppServiceError("Failed to archive form", API_ERROR_CODES.INTERNAL_ERROR);
  }

  return mapFormRecord(form);
}

export async function unarchiveForm(
  userId: string,
  payload: UnarchiveFormInput,
): Promise<FormRecord> {
  const { formId } = await unarchiveFormInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const updated = await db
    .update(formsTable)
    .set({ archivedAt: null })
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
    .returning();

  const form = updated[0];
  if (!form) {
    throw new AppServiceError("Failed to restore form", API_ERROR_CODES.INTERNAL_ERROR);
  }

  return mapFormRecord(form);
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
    throw new AppServiceError("Failed to publish form", API_ERROR_CODES.INTERNAL_ERROR);
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
    throw new AppServiceError("Failed to unpublish form", API_ERROR_CODES.INTERNAL_ERROR);
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
    throw new AppServiceError(
      "Failed to update form visibility",
      API_ERROR_CODES.INTERNAL_ERROR,
    );
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
    throw new AppServiceError(
      "Failed to update form response status",
      API_ERROR_CODES.INTERNAL_ERROR,
    );
  }

  return mapFormRecord(form);
}
