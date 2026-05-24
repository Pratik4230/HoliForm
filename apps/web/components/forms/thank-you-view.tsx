"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { HoliConfetti } from "~/components/forms/holi-confetti";

function safeDecodeMessage(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type ThankYouViewProps = {
  username: string;
  slug: string;
  message: string;
};

export function ThankYouView({ username, slug, message }: ThankYouViewProps) {
  return (
    <div className="relative min-h-svh px-4 py-16">
      <HoliConfetti />
      <Card className="relative z-10 mx-auto max-w-lg border-0 text-center shadow-xl">
        <CardHeader className="space-y-4 pb-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-cyan-400 text-3xl">
            ✓
          </div>
          <CardTitle className="text-2xl">Submitted!</CardTitle>
          <CardDescription className="text-base">{safeDecodeMessage(message)}</CardDescription>
          <Button asChild variant="outline" className="mt-2">
            <Link href={`/f/${username}/${slug}`}>Fill again</Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
