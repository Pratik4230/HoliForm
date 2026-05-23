import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Globe } from "lucide-react";
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
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
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
        <Button asChild className="w-full" variant="outline">
          <Link href={fillUrl}>
            Fill form
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
