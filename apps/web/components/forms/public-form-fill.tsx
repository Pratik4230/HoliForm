"use client";

import { useMemo, useState } from "react";
import {
  type PublicFormOutput,
  usePublicForm,
  useSubmitFormResponse,
} from "~/hooks/api/form";
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

type FormField = PublicFormOutput["fields"][number];

type PublicFormFillProps = {
  username: string;
  slug: string;
};

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
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

function isStepValid(field: FormField, value: unknown) {
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

export function PublicFormFill({ username, slug }: PublicFormFillProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [thankYouMessage, setThankYouMessage] = useState<string | null>(null);

  const query = usePublicForm(username, slug);
  const submitMutation = useSubmitFormResponse({
    onSuccess: (data) => {
      setThankYouMessage(data.thankYouMessage);
    },
  });

  const fields = query.data?.fields ?? [];
  const form = query.data?.form;
  const currentField = fields[stepIndex];
  const progress = fields.length > 0 ? ((stepIndex + 1) / fields.length) * 100 : 100;

  const canAdvance = useMemo(() => {
    if (!currentField) {
      return true;
    }
    return isStepValid(currentField, answers[currentField.labelKey]);
  }, [answers, currentField]);

  if (query.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (query.isError || !form) {
    return (
      <Card className="mx-auto mt-16 max-w-lg">
        <CardHeader>
          <CardTitle>Form unavailable</CardTitle>
          <CardDescription>
            This form does not exist, is not published, or cannot be opened.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (thankYouMessage) {
    return (
      <Card className="mx-auto mt-16 max-w-lg border-0 text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Submitted</CardTitle>
          <CardDescription className="text-base">{thankYouMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!form.acceptingResponses) {
    return (
      <Card className="mx-auto mt-16 max-w-lg">
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          <CardDescription>This form is no longer accepting responses.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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

    await submitMutation.mutateAsync({
      username,
      slug,
      answers,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12">
      <div className="mb-8 space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          {stepIndex + 1} of {fields.length}
        </p>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{form.title}</CardTitle>
          {stepIndex === 0 && form.description ? (
            <CardDescription>{form.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
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

          {submitMutation.isError ? (
            <p className="text-destructive text-sm">
              Could not submit your answers. Check required fields and try again.
            </p>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0 || submitMutation.isPending}
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={!canAdvance || submitMutation.isPending}
              onClick={() => void handleNext()}
            >
              {submitMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Submitting…
                </>
              ) : isLastStep ? (
                "Submit"
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
