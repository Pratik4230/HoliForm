"use client";

import { useRouter } from "next/navigation";
import { usePublicForm, useSubmitFormResponse } from "~/hooks/api/form";
import { getPublicFormErrorMessage } from "~/lib/api-error";
import { FormFillExperience } from "~/components/forms/form-fill-experience";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";

type PublicFormFillProps = {
  username: string;
  slug: string;
};

export function PublicFormFill({ username, slug }: PublicFormFillProps) {
  const router = useRouter();
  const query = usePublicForm(username, slug);
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
          <CardDescription>This form is no longer accepting responses.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <FormFillExperience
      form={form}
      fields={fields}
      theme={theme}
      mode="live"
      isSubmitting={submitMutation.isPending}
      submitError={submitMutation.isError}
      onSubmit={async (answers, honeypot) => {
        await submitMutation.mutateAsync({
          username,
          slug,
          answers,
          _hpWebsite: honeypot,
        });
      }}
    />
  );
}
