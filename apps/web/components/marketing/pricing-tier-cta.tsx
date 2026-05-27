"use client";

import { MarketingAuthCta } from "~/components/marketing/marketing-auth-cta";

export function PricingTierCta() {
  return (
    <MarketingAuthCta
      signedOutLabel="Get started"
      signedInLabel="Go to dashboard"
      className="w-full"
    />
  );
}
