"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  Copy,
  CopyPlus,
  ExternalLink,
  EyeOff,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Empty } from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { getPublicFormUrl } from "~/lib/form-url";
import { useSession } from "~/hooks/api/auth";
import {
  useArchiveForm,
  useCloneForm,
  useDeleteForm,
  useListForms,
  useUnarchiveForm,
} from "~/hooks/api/form";

function statusBadge(
  status: "draft" | "published",
  visibility: "public" | "unlisted",
  archived: boolean,
) {
  if (archived) {
    return (
      <Badge variant="secondary" className="text-xs font-semibold">
        <Archive className="mr-1 size-3" />
        Archived
      </Badge>
    );
  }
  if (status === "draft") {
    return (
      <Badge
        className="border-0 text-xs font-semibold"
        style={{ background: "#F3F4F6", color: "#6B7280" }}
      >
        Draft
      </Badge>
    );
  }
  if (visibility === "unlisted") {
    return (
      <Badge variant="secondary" className="text-xs font-semibold">
        <EyeOff className="mr-1 size-3" />
        Unlisted
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs font-semibold" style={{ color: HOLI.green }}>
      <Globe className="mr-1 size-3" />
      Published
    </Badge>
  );
}



function FormCard({
  form,
  username,
  onCopyLink,
}: {
  form: NonNullable<ReturnType<typeof useListForms>["data"]>[number];
  username: string;
  onCopyLink: (username: string, slug: string) => void;
}) {
  const deleteForm = useDeleteForm();
  const cloneForm = useCloneForm();
  const archiveForm = useArchiveForm(form.id);
  const unarchiveForm = useUnarchiveForm(form.id);
  const isArchived = Boolean(form.archivedAt);

  return (
    <motion.div variants={cardVariants}>
      <div
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/60 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{ boxShadow: `0 12px 34px ${HOLI.yellow}10` }}
      >
        <div
          className="pointer-events-none h-1 w-full opacity-70"
          style={{
            background: `linear-gradient(90deg, ${HOLI.pink}aa, ${HOLI.yellow}aa, ${HOLI.green}aa, ${HOLI.orange}aa)`,
          }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-2 p-4 pb-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{form.title}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">/{form.slug}</p>
          </div>
          {statusBadge(form.status, form.visibility, isArchived)}
        </div>
        <div className="flex-1 px-4 pb-4">
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {form.description || "No description"}
          </p>
          {form.updatedAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-background/40 px-4 py-3 backdrop-blur-md">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/forms/${form.id}`}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
          {form.status === "published" && username && !isArchived ? (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-xs"
              onClick={() => onCopyLink(username, form.slug)}
            >
              <Copy className="size-3.5" />
              Copy link
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-auto rounded-full">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {form.status === "published" && username && !isArchived ? (
                <DropdownMenuItem asChild>
                  <a
                    href={getPublicFormUrl(username, form.slug)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Open public form
                  </a>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                disabled={cloneForm.isPending}
                onClick={() => cloneForm.mutate({ formId: form.id })}
              >
                <CopyPlus className="size-4" />
                Clone
              </DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem
                  disabled={unarchiveForm.isPending}
                  onClick={() => unarchiveForm.mutate({ formId: form.id })}
                >
                  <ArchiveRestore className="size-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={archiveForm.isPending}
                  onClick={() => {
                    if (confirm(`Archive "${form.title}"?`)) {
                      archiveForm.mutate({ formId: form.id });
                    }
                  }}
                >
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm(`Delete "${form.title}"?`)) {
                    deleteForm.mutate({ formId: form.id });
                  }
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function FormsList() {
  const session = useSession();
  const { data: forms, isLoading } = useListForms();

  const copyLink = (username: string, slug: string) => {
    const url = getPublicFormUrl(username, slug);
    void navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!forms?.length) {
    return (
      <Empty className="rounded-2xl border border-dashed border-border bg-background/60 py-16 backdrop-blur-md">
        <div className="mx-auto max-w-sm text-center">
          <p className="text-xl font-bold text-foreground">No forms yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first form and start collecting responses.
          </p>
          <Button
            asChild
            className="mt-6 border-0 font-semibold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})` }}
          >
            <Link href="/dashboard/forms/new">Create your first form</Link>
          </Button>
        </div>
      </Empty>
    );
  }

  const username = session.data?.username ?? "";

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const activeForms = forms.filter((form) => !form.archivedAt);
  const archivedForms = forms.filter((form) => form.archivedAt);

  return (
    <div className="space-y-8">
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {activeForms.map((form) => (
          <FormCard
            key={form.id}
            form={form}
            username={username}
            onCopyLink={copyLink}
          />
        ))}
      </motion.div>
      {archivedForms.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Archived</h2>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {archivedForms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                username={username}
                onCopyLink={copyLink}
              />
            ))}
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
