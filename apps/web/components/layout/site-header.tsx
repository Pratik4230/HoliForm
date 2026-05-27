"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { useSession } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
];

function NavLink({
  href,
  label,
  pathname,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
      {active ? (
        <span
          className="pointer-events-none absolute -bottom-2 left-0 hidden h-0.5 w-full rounded-full sm:block"
          style={{
            background: `linear-gradient(90deg, ${HOLI.pink}, ${HOLI.yellow}, ${HOLI.orange})`,
          }}
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const session = useSession();
  const isAuthed = Boolean(session.data);
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryCta = isAuthed ? (
    <Button
      asChild
      size="sm"
      className="border-0 font-semibold text-white shadow-sm sm:size-default"
      style={{ background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})` }}
    >
      <Link href="/dashboard">Dashboard</Link>
    </Button>
  ) : (
    <Button
      asChild
      size="sm"
      className="border-0 font-semibold text-white shadow-sm sm:size-default"
      style={{ background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})` }}
    >
      <Link href="/signup">Get started</Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-70"
        style={{
          background: `linear-gradient(90deg, ${HOLI.pink}22, ${HOLI.yellow}26, ${HOLI.green}20, ${HOLI.orange}24)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${HOLI.pink}88, ${HOLI.yellow}88, ${HOLI.orange}88, transparent)`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex h-14 min-h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <Link href="/" className="relative flex min-w-0 items-center gap-2">
          <span
            className="pointer-events-none absolute -left-3 -top-2 h-10 w-10 rounded-full blur-xl"
            style={{ backgroundColor: `${HOLI.yellow}55` }}
            aria-hidden
          />
          <FileText className="relative size-5 shrink-0 text-foreground" />
          <span
            className="truncate text-base font-semibold tracking-tight"
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

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
              className="relative"
            />
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {isAuthed ? (
              primaryCta
            ) : (
              <>
                <Button asChild variant="ghost" className="text-sm font-medium">
                  <Link href="/login">Log in</Link>
                </Button>
                {primaryCta}
              </>
            )}
          </div>

          <div className="sm:hidden">{primaryCta}</div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onNavigate={() => setMenuOpen(false)}
                    className="text-base py-1"
                  />
                ))}
                <div className="my-2 h-px bg-border" />
                {isAuthed ? (
                  <Button
                    asChild
                    className="h-11 w-full border-0 font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})` }}
                  >
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="h-11 w-full">
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-11 w-full border-0 font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})` }}
                    >
                      <Link href="/signup" onClick={() => setMenuOpen(false)}>
                        Get started
                      </Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
