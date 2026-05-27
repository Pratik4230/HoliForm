import { Check } from "lucide-react";
import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { SiteHeader } from "~/components/layout/site-header";
import { PricingTierCta } from "~/components/marketing/pricing-tier-cta";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "Free",
    description: "Perfect for side projects and demos.",
    features: [
      "Unlimited forms",
      "Public & unlisted links",
      "Step-by-step fill UX",
      "Basic themes",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499/mo",
    description: "For creators who want analytics and email alerts.",
    features: [
      "Everything in Free",
      "Response analytics",
      "Email on new response",
      "Rate limiting & spam guard",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Teams, white-label, and enterprise SSO.",
    features: ["CSV export", "Webhooks", "Priority support", "Custom domains"],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <HoliLoginScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-5xl px-3 py-10 sm:px-4 sm:py-16">
        <div className="mb-10 text-center sm:mb-12">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{
              background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange}, ${HOLI.yellow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Premium pricing, simple choices
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            No real payments in the demo pick a tier that matches your story.
          </p>
        </div>
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className="relative overflow-hidden rounded-2xl border border-border bg-background/70 shadow-sm backdrop-blur-md"
              style={{ boxShadow: `0 10px 30px ${HOLI.yellow}12` }}
            >
              {/* premium holi border for highlight */}
              {tier.highlight ? (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl p-px"
                  style={{
                    background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.yellow}, ${HOLI.orange})`,
                  }}
                  aria-hidden
                >
                  <div className="h-full w-full rounded-2xl bg-background/70" />
                </div>
              ) : null}

              {/* top stripe */}
              <div
                className="pointer-events-none h-1 w-full opacity-70"
                style={{
                  background: tier.highlight
                    ? `linear-gradient(90deg, ${HOLI.pink}cc, ${HOLI.yellow}cc, ${HOLI.orange}cc)`
                    : `linear-gradient(90deg, ${HOLI.green}99, ${HOLI.yellow}99, ${HOLI.orange}99)`,
                }}
                aria-hidden
              />

              <CardHeader className={tier.highlight ? "relative z-10 pt-5" : "pt-5"}>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  {tier.highlight ? (
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})`,
                      }}
                    >
                      Most popular
                    </span>
                  ) : null}
                </div>
                <CardDescription>{tier.description}</CardDescription>
                <p className="pt-2 text-3xl font-bold tracking-tight">{tier.price}</p>
              </CardHeader>
              <CardContent className={tier.highlight ? "relative z-10" : ""}>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0" style={{ color: HOLI.green }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className={tier.highlight ? "relative z-10" : ""}>
                <PricingTierCta />
              </CardFooter>

              {/* soft glow */}
              {tier.highlight ? (
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                  style={{ backgroundColor: `${HOLI.yellow}55` }}
                  aria-hidden
                />
              ) : null}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
