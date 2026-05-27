"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { useSession, useSignOut } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

const creatorMenuItems = [
  { href: "/dashboard", label: "My forms", icon: LayoutDashboard },
  { href: "/dashboard/forms/new", label: "New form", icon: Plus },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const siteMenuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useSession();
  const signOutMutation = useSignOut();

  const initials =
    session.data?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border bg-background/65 backdrop-blur-md">
        {/* subtle holi wash inside sidebar */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70"
          style={{
            background: `linear-gradient(90deg, ${HOLI.pink}14, ${HOLI.yellow}14, ${HOLI.green}12, ${HOLI.orange}14)`,
          }}
          aria-hidden
        />
        <SidebarHeader className="gap-3 p-4">
          <Link href="/dashboard" className="relative flex items-center gap-2">
            <span
              className="pointer-events-none absolute -left-2 -top-2 h-10 w-10 rounded-full blur-xl"
              style={{ backgroundColor: `${HOLI.yellow}44` }}
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
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Creator
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {creatorMenuItems.map((item) => {
                  const isActive = isNavItemActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-background/70 text-foreground shadow-sm ring-1 ring-border backdrop-blur-md"
                              : "text-foreground hover:bg-accent/50",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-4",
                              isActive ? "text-foreground" : "text-muted-foreground",
                            )}
                          />
                          <span>{item.label}</span>
                          {isActive ? (
                            <span
                              className="pointer-events-none absolute inset-x-2 -bottom-1 h-0.5 rounded-full opacity-80"
                              style={{
                                background: `linear-gradient(90deg, ${HOLI.pink}, ${HOLI.yellow}, ${HOLI.orange})`,
                              }}
                              aria-hidden
                            />
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Site
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {siteMenuItems.map((item) => {
                  const isActive = isNavItemActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-background/70 text-foreground shadow-sm ring-1 ring-border backdrop-blur-md"
                              : "text-foreground hover:bg-accent/50",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-4",
                              isActive ? "text-foreground" : "text-muted-foreground",
                            )}
                          />
                          <span>{item.label}</span>
                          {isActive ? (
                            <span
                              className="pointer-events-none absolute inset-x-2 -bottom-1 h-0.5 rounded-full opacity-80"
                              style={{
                                background: `linear-gradient(90deg, ${HOLI.pink}, ${HOLI.yellow}, ${HOLI.orange})`,
                              }}
                              aria-hidden
                            />
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-3 shadow-sm backdrop-blur-md">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{session.data?.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">@{session.data?.username}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-sm text-muted-foreground hover:text-foreground"
            onClick={() => signOutMutation.mutate({})}
            disabled={signOutMutation.isPending}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="relative min-h-svh bg-background">
        <HoliLoginScene />
        <header className="relative z-10 flex h-14 items-center gap-2 border-b border-border bg-background/70 px-4 backdrop-blur-md">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-60"
            style={{
              background: `linear-gradient(90deg, ${HOLI.yellow}12, ${HOLI.pink}10, ${HOLI.orange}12)`,
            }}
            aria-hidden
          />
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Creator studio</span>
        </header>
        <main className={cn("relative z-10 flex-1 p-4 md:p-6")}>
          <div className="rounded-3xl border border-border/60 bg-background/55 p-4 shadow-sm backdrop-blur-xl md:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
