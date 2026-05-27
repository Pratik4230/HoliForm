import { BarChart3, Palette, Zap } from "lucide-react";
import { FeaturedPublicForms } from "~/components/forms/featured-public-forms";
import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { SiteHeader } from "~/components/layout/site-header";
import { HomeCtaSection } from "~/components/marketing/home-cta-section";
import { HomeHeroActions } from "~/components/marketing/home-hero-actions";

const features = [
  {
    title: "Typeform-style flow",
    description: "One question at a time on a distraction-free canvas. Respondents love it.",
    icon: Zap,
  },
  {
    title: "Publish in seconds",
    description: "Draft, add fields, hit Publish. Your form is live at /f/username/slug instantly.",
    icon: Palette,
  },
  {
    title: "Rich analytics",
    description: "Track responses, see field breakdowns, and export your data anytime.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Festive Holi ambience (subtle) */}
      <HoliLoginScene />
      <SiteHeader />

      {/* Holi halo behind hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-70"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 35% 25%, ${HOLI.yellow}22 0%, transparent 60%),
            radial-gradient(ellipse 50% 45% at 70% 20%, ${HOLI.pink}22 0%, transparent 60%),
            radial-gradient(ellipse 70% 55% at 50% 55%, ${HOLI.orange}18 0%, transparent 65%)
          `,
        }}
        aria-hidden
      />

      <div className="relative z-10">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center md:pt-28">
          <h1
            className="text-5xl font-bold tracking-tight md:text-6xl"
            style={{
              background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange}, ${HOLI.yellow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Forms that feel like Holi
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A simple Typeform-style builder. Share a link no login needed to respond.
          </p>

          <HomeHeroActions />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card required", "Unlimited forms on free tier", "Anonymous responses"].map(
              (txt) => (
                <span key={txt} className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: HOLI.green }}
                    aria-hidden
                  />
                  {txt}
                </span>
              ),
            )}
          </div>
        </section>

        {/* ── Featured public forms ── */}
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Explore public forms</h2>
            <p className="mt-2 text-muted-foreground">
              See what creators are sharing open a form and fill it in seconds.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-2 backdrop-blur-md">
            <FeaturedPublicForms limit={6} />
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-24 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-background/70 p-6 shadow-sm backdrop-blur-md"
            >
              <feature.icon className="mb-3 size-5" style={{ color: HOLI.orange }} />
              <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>

        <HomeCtaSection />
      </div>
    </div>
  );
}
