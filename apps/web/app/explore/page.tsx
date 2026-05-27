import { ExploreForms } from "~/components/forms/explore-forms";
import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { SiteHeader } from "~/components/layout/site-header";
import { MarketingAuthCta } from "~/components/marketing/marketing-auth-cta";

export default function ExplorePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <HoliLoginScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 space-y-2 text-center md:text-left">
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{
              background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange}, ${HOLI.yellow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Explore public forms
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Browse forms creators published for everyone. Unlisted forms are only available via
            direct link and are not listed here.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 p-2 backdrop-blur-md">
          <ExploreForms />
        </div>
        <div className="mt-12 flex justify-center px-2">
          <MarketingAuthCta
            signedOutLabel="Create your own form"
            signedInLabel="Go to dashboard"
          />
        </div>
      </main>
    </div>
  );
}
