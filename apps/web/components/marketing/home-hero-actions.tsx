"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { Button } from "~/components/ui/button";
import { useSession } from "~/hooks/api/auth";

export function HomeHeroActions() {
  const session = useSession();
  const isAuthed = Boolean(session.data);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button
        asChild
        size="lg"
        className="border-0 font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})`,
          boxShadow: `0 8px 24px ${HOLI.pink}22`,
        }}
      >
        <Link href={isAuthed ? "/dashboard" : "/signup"}>
          {isAuthed ? "Go to dashboard" : "Start free"}
          <ArrowRight className="ml-1 size-4" />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/pricing">See pricing</Link>
      </Button>
    </div>
  );
}
