import Link from "next/link";
import { ExploreForms } from "~/components/forms/explore-forms";
import { SiteHeader } from "~/components/layout/site-header";
import { Button } from "~/components/ui/button";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Explore public forms</h1>
          <p className="max-w-2xl text-muted-foreground">
            Browse forms creators published for everyone. Unlisted forms are only available via
            direct link and are not listed here.
          </p>
        </div>
        <ExploreForms />
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/signup">Create your own form</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
