"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { useSession } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const session = useSession();
  const isAuthed = Boolean(session.data);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      {/* Holi top wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-70"
        style={{
          background: `linear-gradient(90deg, ${HOLI.pink}22, ${HOLI.yellow}26, ${HOLI.green}20, ${HOLI.orange}24)`,
        }}
        aria-hidden
      />
      {/* subtle underline */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${HOLI.pink}88, ${HOLI.yellow}88, ${HOLI.orange}88, transparent)`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2">
          <span
            className="pointer-events-none absolute -left-3 -top-2 h-10 w-10 rounded-full blur-xl"
            style={{ backgroundColor: `${HOLI.yellow}55` }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute left-4 top-2 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: HOLI.hotPink }}
            aria-hidden
          />
          <FileText className="relative size-5 text-foreground" />
          <span
            className="text-base font-semibold tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange}, ${HOLI.yellow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            HoliForm
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground",
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span
                  className="pointer-events-none absolute -bottom-2 left-0 h-0.5 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${HOLI.pink}, ${HOLI.yellow}, ${HOLI.orange})`,
                  }}
                  aria-hidden
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Button
              asChild
              className="border-0 font-semibold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})` }}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-sm font-medium">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="border-0 font-semibold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})` }}
              >
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
