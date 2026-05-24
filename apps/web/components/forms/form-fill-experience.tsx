"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { FormThemeConfig } from "@repo/validators/forms";
import type { PublicFormOutput } from "~/hooks/api/form";
import { themeToCssVariables } from "~/lib/form-theme-styles";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";

export type FormFillField = PublicFormOutput["fields"][number];

type FormFillExperienceProps = {
  form: {
    title: string;
    description: string;
  };
  fields: FormFillField[];
  theme?: FormThemeConfig;
  mode: "live" | "preview";
  onSubmit: (answers: Record<string, unknown>, honeypot?: string) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: boolean;
};

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormFillField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const choices = field.options?.choices ?? [];

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={field.labelKey}
          placeholder={field.placeholder ?? undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      );
    case "number":
      return (
        <Input
          id={field.labelKey}
          type="number"
          min={field.options?.min}
          max={field.options?.max}
          placeholder={field.placeholder ?? undefined}
          value={value === undefined || value === "" ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
    case "checkbox":
      if (choices.length > 0) {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="flex flex-col gap-2">
            {choices.map((choice) => (
              <label key={choice} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(choice)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selected, choice]);
                    } else {
                      onChange(selected.filter((item) => item !== choice));
                    }
                  }}
                />
                {choice}
              </label>
            ))}
          </div>
        );
      }
      return (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
          />
          {field.label}
        </label>
      );
    case "radio":
      return (
        <RadioGroup
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
          className="flex flex-col gap-2"
        >
          {choices.map((choice) => (
            <label key={choice} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={choice} id={`${field.labelKey}-${choice}`} />
              {choice}
            </label>
          ))}
        </RadioGroup>
      );
    case "select":
      return (
        <Select value={typeof value === "string" ? value : ""} onValueChange={onChange}>
          <SelectTrigger id={field.labelKey}>
            <SelectValue placeholder={field.placeholder ?? "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {choices.map((choice) => (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-col gap-2">
          {choices.map((choice) => (
            <label key={choice} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(choice)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, choice]);
                  } else {
                    onChange(selected.filter((item) => item !== choice));
                  }
                }}
              />
              {choice}
            </label>
          ))}
        </div>
      );
    }
    case "email":
      return (
        <Input
          id={field.labelKey}
          type="email"
          placeholder={field.placeholder ?? undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return (
        <Input
          id={field.labelKey}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <Input
          id={field.labelKey}
          type={field.type === "phone" ? "tel" : "text"}
          placeholder={field.placeholder ?? undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function isStepValid(field: FormFillField, value: unknown) {
  if (!field.isRequired) {
    return true;
  }
  if (value === undefined || value === null || value === "") {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  return true;
}

export function FormFillExperience({
  form,
  fields,
  theme,
  mode,
  onSubmit,
  isSubmitting = false,
  submitError = false,
}: FormFillExperienceProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [honeypot, setHoneypot] = useState("");

  const currentField = fields[stepIndex];
  const progress = fields.length > 0 ? ((stepIndex + 1) / fields.length) * 100 : 100;

  const canAdvance = useMemo(() => {
    if (!currentField) {
      return true;
    }
    return isStepValid(currentField, answers[currentField.labelKey]);
  }, [answers, currentField]);

  if (fields.length === 0) {
    return (
      <Card className="mx-auto mt-16 max-w-lg">
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          <CardDescription>This form has no questions yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isLastStep = stepIndex >= fields.length - 1;

  const handleNext = async () => {
    if (!currentField || !canAdvance) {
      return;
    }

    if (!isLastStep) {
      setStepIndex((index) => index + 1);
      return;
    }

    await onSubmit(answers, mode === "live" ? honeypot : undefined);
  };

  const themeStyle = theme ? themeToCssVariables(theme) : undefined;

  return (
    <div
      className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12"
      style={themeStyle}
    >
      <div className="mb-6 space-y-2 sm:mb-8">
        <p className="text-sm font-medium opacity-80">
          {stepIndex + 1} of {fields.length}
        </p>
        <Progress
          value={progress}
          className="h-2"
          style={
            theme ? ({ ["--primary" as string]: theme.primaryColor } as CSSProperties) : undefined
          }
        />
      </div>

      <Card
        className="relative border-0 shadow-xl"
        style={
          theme
            ? {
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                borderColor: `${theme.primaryColor}33`,
              }
            : undefined
        }
      >
        <CardHeader>
          <CardTitle className="text-2xl">{form.title}</CardTitle>
          {stepIndex === 0 && form.description ? (
            <CardDescription>{form.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "live" ? (
            <input
              type="text"
              name="_hpWebsite"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />
          ) : null}
          {currentField ? (
            <Field>
              <FieldLabel htmlFor={currentField.labelKey}>
                {currentField.label}
                {currentField.isRequired ? " *" : ""}
              </FieldLabel>
              {currentField.description ? (
                <FieldDescription>{currentField.description}</FieldDescription>
              ) : null}
              <FieldInput
                field={currentField}
                value={answers[currentField.labelKey]}
                onChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [currentField.labelKey]: value }))
                }
              />
            </Field>
          ) : null}

          {submitError ? (
            <p className="text-destructive text-sm">
              Could not submit your answers. Check required fields and try again.
            </p>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0 || isSubmitting}
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            >
              Back
            </Button>
            <Button
              type="button"
              className="min-h-11 min-w-24 sm:min-h-10"
              style={theme ? { backgroundColor: theme.primaryColor, color: "#fff" } : undefined}
              disabled={!canAdvance || isSubmitting}
              onClick={() => void handleNext()}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  Submitting…
                </>
              ) : isLastStep ? (
                mode === "preview" ? "Submit (preview)" : "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
