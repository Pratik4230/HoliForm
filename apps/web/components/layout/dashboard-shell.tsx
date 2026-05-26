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
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="gap-3 p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FileText className="size-5 text-foreground" />
            <span className="text-base font-semibold text-foreground">HoliForm</span>
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
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
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
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
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
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
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

      <SidebarInset className="min-h-svh bg-background">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Creator studio</span>
        </header>
        <main className={cn("flex-1 p-4 md:p-6")}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
