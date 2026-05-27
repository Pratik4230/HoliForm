import Link from "next/link";
import { Plus } from "lucide-react";
import { FormsList } from "~/components/dashboard/forms-list";
import { Button } from "~/components/ui/button";
import { HOLI } from "~/components/auth/holi/holi-colors";

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Your forms</h1>
          <p className="text-sm text-muted-foreground">
            Build, publish, and share your forms.
          </p>
        </div>
        <Button
          asChild
          className="h-11 w-full shrink-0 border-0 font-semibold text-white shadow-md sm:h-10 sm:w-auto"
          style={{ background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})` }}
        >
          <Link href="/dashboard/forms/new">
            <Plus className="size-4" />
            New form
          </Link>
        </Button>
      </div>
      <FormsList />
    </div>
  );
}
