import { Suspense } from "react";

import { VerifyEmailForm } from "~/components/auth/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
