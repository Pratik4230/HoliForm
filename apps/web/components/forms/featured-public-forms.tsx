"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicFormCard } from "~/components/forms/public-form-card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useListPublicForms } from "~/hooks/api/form";

export function FeaturedPublicForms({ limit = 6 }: { limit?: number }) {
  const { data: forms, isLoading } = useListPublicForms(limit);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit }).map((_, index) => (
          <Skeleton key={index} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!forms?.length) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No public forms to show yet. Publish a form with public visibility to appear here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <PublicFormCard key={form.id} form={form} />
        ))}
      </div>
      <div className="text-center">
        <Button asChild variant="outline">
          <Link href="/explore">
            Browse all public forms
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
