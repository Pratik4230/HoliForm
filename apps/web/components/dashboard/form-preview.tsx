"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { FormFillExperience } from "~/components/forms/form-fill-experience";
import { HoliConfetti } from "~/components/forms/holi-confetti";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { useAuthGuard } from "~/hooks/api/auth";
import { useFormById, useListFormThemes } from "~/hooks/api/form";
import { resolveThemeFromPresets } from "~/lib/form-theme-styles";

function PreviewThankYou({
  message,
  formId,
  onRestart,
}: {
  message: string;
  formId: string;
  onRestart: () => void;
}) {
  return (
    <div className="relative min-h-svh px-4 py-16">
      <HoliConfetti />
      <Card className="relative z-10 mx-auto max-w-lg border-0 text-center shadow-xl">
        <CardHeader className="space-y-4 pb-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-cyan-400 text-3xl">
            ✓
          </div>
          <CardTitle className="text-2xl">Preview complete</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
          <p className="text-sm text-muted-foreground">
            This was a preview — no response was saved.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onRestart}>
              <RotateCcw className="size-4" />
              Restart preview
            </Button>
            <Button asChild>
              <Link href={`/dashboard/forms/${formId}`}>Back to editor</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function FormPreview({ formId }: { formId: string }) {
  const session = useAuthGuard();
  const { data, isLoading, isError } = useFormById(formId);
  const { data: themes, isLoading: themesLoading } = useListFormThemes();
  const [previewKey, setPreviewKey] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (session.isLoading || isLoading || themesLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!session.data || isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Form not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This form does not exist or you do not have access to preview it.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const { form, fields } = data;
  const sortedFields = [...fields].sort((a, b) => Number(a.index) - Number(b.index));
  const theme = resolveThemeFromPresets(form.themeId, themes ?? []);
  const thankYouMessage = form.thankYouMessage ?? "Thank you for your response!";

  if (completed) {
    return (
      <PreviewThankYou
        message={thankYouMessage}
        formId={formId}
        onRestart={() => {
          setCompleted(false);
          setPreviewKey((key) => key + 1);
        }}
      />
    );
  }

  return (
    <div className="min-h-svh">
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeft className="size-4" />
              Back to editor
            </Link>
          </Button>
          <Badge variant="secondary">Preview mode</Badge>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Responses are not saved
          </p>
        </div>
      </div>

      <FormFillExperience
        key={previewKey}
        form={form}
        fields={sortedFields}
        theme={theme}
        mode="preview"
        onSubmit={async () => {
          setCompleted(true);
        }}
      />
    </div>
  );
}
