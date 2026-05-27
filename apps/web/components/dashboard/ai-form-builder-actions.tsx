"use client";

import Link from "next/link";
import { Copy, ExternalLink, Globe, EyeOff, Pencil, Rocket, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { useSession } from "~/hooks/api/auth";
import {
  usePublishForm,
  useUnpublishForm,
  type FormByIdOutput,
} from "~/hooks/api/form";
import { getPublicFormUrl } from "~/lib/form-url";

function FormStatusBadge({ form }: { form: FormByIdOutput["form"] }) {
  if (form.archivedAt) {
    return <Badge variant="secondary">Archived</Badge>;
  }
  if (form.status === "draft") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Draft
      </Badge>
    );
  }
  if (form.visibility === "unlisted") {
    return (
      <Badge variant="secondary">
        <EyeOff className="mr-1 size-3" />
        Live · Unlisted
      </Badge>
    );
  }
  return (
    <Badge variant="outline" style={{ color: HOLI.green }}>
      <Globe className="mr-1 size-3" />
      Live · Public
    </Badge>
  );
}

type AiFormBuilderActionsProps = {
  formData: FormByIdOutput;
  fieldCount: number;
  variant?: "header" | "preview";
};

export function AiFormBuilderActions({
  formData,
  fieldCount,
  variant = "header",
}: AiFormBuilderActionsProps) {
  const session = useSession();
  const form = formData.form;
  const formId = form.id;
  const username = session.data?.username ?? "";

  const publish = usePublishForm(formId);
  const unpublish = useUnpublishForm(formId);

  const isPublished = form.status === "published";
  const canPublish = fieldCount > 0 && !form.archivedAt;
  const shareUrl =
    isPublished && username ? getPublicFormUrl(username, form.slug) : null;

  const copyLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied");
  };

  const handlePublish = () => {
    publish.mutate(
      { formId },
      {
        onSuccess: () => {
          toast.success("Form is live! Copy the link to share it.");
        },
      },
    );
  };

  const handleUnpublish = () => {
    unpublish.mutate(
      { formId },
      {
        onSuccess: () => {
          toast.success("Form unpublished (back to draft)");
        },
      },
    );
  };

  if (variant === "preview") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <FormStatusBadge form={form} />
        <span className="text-xs text-muted-foreground">
          {fieldCount} question{fieldCount === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        <FormStatusBadge form={form} />
        {!canPublish ? (
          <span className="text-xs text-muted-foreground">Add questions before publishing</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {isPublished ? (
          <>
            <Button
              variant="outline"
              className="h-10"
              disabled={unpublish.isPending}
              onClick={handleUnpublish}
            >
              <Undo2 className="size-4" />
              Unpublish
            </Button>
            {shareUrl ? (
              <>
                <Button variant="outline" className="h-10" onClick={copyLink}>
                  <Copy className="size-4" />
                  Copy link
                </Button>
                <Button asChild variant="outline" className="h-10">
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open live
                  </a>
                </Button>
              </>
            ) : null}
          </>
        ) : (
          <Button
            className="h-10 border-0 font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})` }}
            disabled={!canPublish || publish.isPending}
            onClick={handlePublish}
          >
            <Rocket className="size-4" />
            {publish.isPending ? "Publishing…" : "Publish form"}
          </Button>
        )}
        <Button asChild variant="outline" className="h-10">
          <Link href={`/dashboard/forms/${formId}`}>
            <Pencil className="size-4" />
            Editor
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-10">
          <Link href={`/preview/${formId}`}>Preview</Link>
        </Button>
      </div>
    </div>
  );
}
