"use client";

import { PublicFormCard } from "~/components/forms/public-form-card";
import { Empty } from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { useListPublicForms } from "~/hooks/api/form";

export function ExploreForms() {
  const { data: forms, isLoading } = useListPublicForms(48);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!forms?.length) {
    return (
      <Empty className="rounded-xl border border-dashed border-border py-16">
        <div className="mx-auto max-w-md text-center">
          <p className="text-lg font-semibold">No public forms yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When creators publish forms with public visibility, they will show up here.
            Unlisted forms never appear in this gallery.
          </p>
        </div>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <PublicFormCard key={form.id} form={form} />
      ))}
    </div>
  );
}
