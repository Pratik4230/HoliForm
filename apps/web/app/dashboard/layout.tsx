"use client";

import { Spinner } from "~/components/ui/spinner";
import { DashboardShell } from "~/components/layout/dashboard-shell";
import { useAuthGuard } from "~/hooks/api/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuthGuard();

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!session.data) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
