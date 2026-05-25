"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePublicForm, useSubmitFormResponse } from "~/hooks/api/form";
import { getPublicFormErrorMessage } from "~/lib/api-error";
import { loadFormAccessPassword } from "~/lib/form-access-storage";
import { formDraftKey } from "~/lib/form-draft-storage";
import { FormFillExperience } from "~/components/forms/form-fill-experience";
import { PublicFormPasswordGate } from "~/components/forms/public-form-password-gate";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";

type PublicFormFillProps = {
  username: string;
  slug: string;
};

function availabilityMessage(reason: string | null | undefined, form: { maxResponses: number | null; responseCount: number }) {
  switch (reason) {
    case "expired":
      return "This form has expired and is no longer accepting responses.";
    case "response_limit":
      return form.maxResponses
        ? `This form has reached its limit of ${form.maxResponses} responses.`
        : "This form has reached its response limit.";
    case "archived":
      return "This form is no longer available.";
    case "closed":
    default:
      return "This form is no longer accepting responses.";
  }
}

export function PublicFormFill({ username, slug }: PublicFormFillProps) {
  const router = useRouter();
  const query = usePublicForm(username, slug);
  const [accessPassword, setAccessPassword] = useState<string | null>(() =>
    loadFormAccessPassword(username, slug),
  );

  const submitMutation = useSubmitFormResponse({
    onSuccess: (data) => {
      const params = new URLSearchParams({
        message: data.thankYouMessage,
      });
      router.push(`/f/${username}/${slug}/thank-you?${params.toString()}`);
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (query.isError || !query.data?.form) {
    return (
      <Card className="mx-auto mt-16 max-w-lg">
        <CardHeader>
          <CardTitle>Form unavailable</CardTitle>
          <CardDescription>
            {query.isError
              ? getPublicFormErrorMessage(query.error)
              : "This form does not exist, is not published, or cannot be opened."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { form, fields, theme } = query.data;

  if (!form.acceptingResponses) {
    return (
      <Card className="mx-auto mt-16 max-w-lg">
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          <CardDescription>
            {availabilityMessage(form.availabilityReason, form)}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (form.requiresPassword && !accessPassword) {
    return (
      <PublicFormPasswordGate
        username={username}
        slug={slug}
        title={form.title}
        onUnlocked={setAccessPassword}
      />
    );
  }

  return (
    <FormFillExperience
      form={form}
      fields={fields}
      theme={theme}
      mode="live"
      draftKey={formDraftKey(username, slug)}
      isSubmitting={submitMutation.isPending}
      submitError={submitMutation.isError}
      onSubmit={async (answers, honeypot) => {
        await submitMutation.mutateAsync({
          username,
          slug,
          answers,
          accessPassword: accessPassword ?? undefined,
          _hpWebsite: honeypot,
        });
      }}
    />
  );
}
