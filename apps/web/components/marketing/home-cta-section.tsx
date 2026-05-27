"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useSession } from "~/hooks/api/auth";

export function HomeCtaSection() {
  const session = useSession();

  if (session.isLoading) {
    return null;
  }

  if (session.data) {
    return null;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 pb-24">
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h2 className="text-2xl font-bold text-foreground">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">
          Create your account, publish a form, share the link done.
        </p>
        <Button asChild className="mt-6">
          <Link href="/signup">Create a free account</Link>
        </Button>
      </div>
    </section>
  );
}
