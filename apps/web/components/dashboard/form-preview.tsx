"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { FormFillExperience } from "~/components/forms/form-fill-experience";
import { HoliConfetti } from "~/components/forms/holi-confetti";
import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";
import { HOLI } from "~/components/auth/holi/holi-colors";
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
      <HoliLoginScene />
      <HoliConfetti />
      <Card className="relative z-10 mx-auto max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-background/70 text-center shadow-xl backdrop-blur-xl">
        <div
          className="pointer-events-none h-1 w-full opacity-70"
          style={{
            background: `linear-gradient(90deg, ${HOLI.pink}cc, ${HOLI.yellow}cc, ${HOLI.green}cc, ${HOLI.orange}cc)`,
          }}
          aria-hidden
        />
        <CardHeader className="space-y-4 pb-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-linear-to-br from-pink-500 via-yellow-400 to-cyan-400 text-3xl">
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
    <div className="relative min-h-svh">
      <HoliLoginScene />
      <div className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <Button asChild variant="ghost" className="h-10 shrink-0 px-2 sm:px-3">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to editor</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <Badge variant="secondary" className="shrink-0">
            Preview
          </Badge>
          <p className="w-full text-center text-xs text-muted-foreground sm:w-auto sm:text-left sm:text-sm">
            Responses are not saved
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-8">
          <div className="rounded-2xl border border-border/60 bg-background/55 p-2 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:p-4 md:p-6">
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
        </div>
      </div>
    </div>
  );
}
