import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Globe } from "lucide-react";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PublicFormListItem } from "~/hooks/api/form";
import { getPublicFormUrl } from "~/lib/form-url";

export function PublicFormCard({ form }: { form: PublicFormListItem }) {
  const fillUrl = getPublicFormUrl(form.username, form.slug);

  return (
    <Card
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background/70 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
      style={{
        boxShadow: `0 10px 30px ${HOLI.yellow}12`,
      }}
    >
      {/* subtle holi glow stripe */}
      <div
        className="pointer-events-none h-1 w-full opacity-70"
        style={{
          background: `linear-gradient(90deg, ${HOLI.pink}aa, ${HOLI.yellow}aa, ${HOLI.green}aa, ${HOLI.orange}aa)`,
        }}
        aria-hidden
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">{form.title}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs text-green-600">
            <Globe className="mr-1 size-3" />
            Public
          </Badge>
        </div>
        <CardDescription className="font-mono text-xs">@{form.username}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {form.description || "No description"}
        </p>
        {form.updatedAt ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
          </p>
        ) : null}
        {!form.acceptingResponses ? (
          <p className="mt-2 text-xs font-medium text-amber-600">Not accepting responses</p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className="w-full border-0 font-semibold text-white shadow-sm transition-transform group-hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})` }}
        >
          <Link href={fillUrl}>
            Fill form
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
