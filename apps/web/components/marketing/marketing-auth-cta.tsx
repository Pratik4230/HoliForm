"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { useSession } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

type MarketingAuthCtaProps = {
  signedOutLabel: string;
  signedOutHref?: string;
  signedInLabel?: string;
  signedInHref?: string;
  className?: string;
};

export function MarketingAuthCta({
  signedOutLabel,
  signedOutHref = "/signup",
  signedInLabel = "Go to dashboard",
  signedInHref = "/dashboard",
  className,
}: MarketingAuthCtaProps) {
  const session = useSession();
  const isAuthed = Boolean(session.data);

  return (
    <Button
      asChild
      className={cn(
        "h-11 border-0 px-6 font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] sm:h-10",
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})` }}
    >
      <Link href={isAuthed ? signedInHref : signedOutHref}>
        {isAuthed ? signedInLabel : signedOutLabel}
      </Link>
    </Button>
  );
}
