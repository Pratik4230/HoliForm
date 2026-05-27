import { SiteHeader } from "~/components/layout/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-3 py-8 sm:min-h-[calc(100vh-4rem)] sm:px-4 sm:py-12">
        {children}
      </main>
    </div>
  );
}
