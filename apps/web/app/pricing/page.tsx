import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "~/components/layout/site-header";
import { Button } from "~/components/ui/button";
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
    features: ["Unlimited forms", "Public & unlisted links", "Step-by-step fill UX", "Basic themes"],
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground">Simple pricing</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            No real payments in the demo — pick a tier that matches your story.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlight ? "scale-[1.02] shadow-lg border-2 border-foreground/20" : ""}
            >
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <p className="pt-2 text-3xl font-bold">{tier.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
