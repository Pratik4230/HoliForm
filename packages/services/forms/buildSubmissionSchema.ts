import { z } from "zod";
import type { FormFieldRecord } from "@repo/validators/forms";

function applyStringRules(schema: z.ZodType<string>, field: FormFieldRecord) {
  let next: z.ZodType<string> = schema;
  const rules = field.validationRules;
  if (rules?.minLength !== undefined && next instanceof z.ZodString) {
    next = next.min(rules.minLength);
  }
  if (rules?.maxLength !== undefined && next instanceof z.ZodString) {
    next = next.max(rules.maxLength);
  }
  if (rules?.pattern && next instanceof z.ZodString) {
    next = next.regex(new RegExp(rules.pattern));
  }
  return next;
}

function applyNumberRules(schema: z.ZodNumber, field: FormFieldRecord) {
  let next = schema;
  const rules = field.validationRules;
  const options = field.options;
  const min = rules?.min ?? options?.min;
  const max = rules?.max ?? options?.max;
  if (min !== undefined) {
    next = next.min(min);
  }
  if (max !== undefined) {
    next = next.max(max);
  }
  return next;
}

function buildFieldSchema(field: FormFieldRecord): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "email":
      schema = applyStringRules(z.email() as z.ZodType<string>, field);
      break;
    case "number":
    case "rating":
      schema = applyNumberRules(z.coerce.number(), field);
      break;
    case "date":
      schema = z.string();
      break;
    case "time":
      schema = z.string();
      break;
    case "checkbox":
      schema = field.options?.choices?.length
        ? z.array(z.string())
        : z.boolean();
      break;
    case "radio":
    case "select": {
      const choices = field.options?.choices ?? [];
      schema =
        choices.length > 0 ? z.enum(choices as [string, ...string[]]) : z.string();
      break;
    }
    case "multiselect": {
      const choices = field.options?.choices ?? [];
      schema =
        choices.length > 0
          ? z.array(z.enum(choices as [string, ...string[]]))
          : z.array(z.string());
      break;
    }
    case "textarea":
      schema = applyStringRules(z.string(), field);
      break;
    default:
      schema = applyStringRules(z.string(), field);
  }

  if (!field.isRequired) {
    return schema.optional();
  }

  return schema;
}

export function buildSubmissionSchemaFromFields(fields: FormFieldRecord[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    shape[field.labelKey] = buildFieldSchema(field);
  }

  if (Object.keys(shape).length === 0) {
    return z.object(shape);
  }

  return z.object(shape).strict();
}
