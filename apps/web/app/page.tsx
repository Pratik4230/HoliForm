import Link from "next/link";
import { ArrowRight, BarChart3, Palette, Zap } from "lucide-react";
import { SiteHeader } from "~/components/layout/site-header";
import { Button } from "~/components/ui/button";

const features = [
  {
    title: "Typeform-style flow",
    description:
      "One question at a time on a distraction-free canvas. Respondents love it.",
    icon: Zap,
  },
  {
    title: "Publish in seconds",
    description:
      "Draft, add fields, hit Publish. Your form is live at /f/username/slug instantly.",
    icon: Palette,
  },
  {
    title: "Rich analytics",
    description:
      "Track responses, see field breakdowns, and export your data anytime.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center md:pt-28">
        <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Forms that work
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          A simple Typeform-style builder. Share a link — no login needed to respond.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              Start free
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {["No credit card required", "Unlimited forms on free tier", "Anonymous responses"].map(
            (txt) => (
              <span key={txt} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-green-500" />
                {txt}
              </span>
            ),
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-24 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
            <feature.icon className="mb-3 size-5 text-foreground" />
            <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-2xl px-4 pb-24">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">
            Create your account, publish a form, share the link — done.
          </p>
          <Button asChild className="mt-6">
            <Link href="/signup">Create a free account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
