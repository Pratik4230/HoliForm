import Link from "next/link";
import { Plus } from "lucide-react";
import { FormsList } from "~/components/dashboard/forms-list";
import { Button } from "~/components/ui/button";
import { HOLI } from "~/components/auth/holi/holi-colors";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your forms</h1>
          <p className="text-sm text-muted-foreground">
            Build, publish, and share your forms.
          </p>
        </div>
        <Button
          asChild
          className="border-0 font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
