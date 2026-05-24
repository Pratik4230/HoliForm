"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Copy, ExternalLink, EyeOff, Globe, MoreHorizontal, Pencil, Trash2, CopyPlus } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
import { useCloneForm, useDeleteForm, useListForms } from "~/hooks/api/form";

function statusBadge(status: "draft" | "published", visibility: "public" | "unlisted") {
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
    <Badge variant="outline" className="text-xs font-semibold text-green-600">
      <Globe className="mr-1 size-3" />
      Published
    </Badge>
  );
}



export function FormsList() {
  const session = useSession();
  const { data: forms, isLoading } = useListForms();
  const deleteForm = useDeleteForm();
  const cloneForm = useCloneForm();

  const copyLink = (username: string, slug: string) => {
    const url = getPublicFormUrl(username, slug);
    void navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!forms?.length) {
    return (
      <Empty className="rounded-xl border border-dashed border-border py-16">
        <div className="mx-auto max-w-sm text-center">
          <p className="text-xl font-bold text-foreground">No forms yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first form and start collecting responses.
          </p>
          <Button asChild className="mt-6">
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
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  };

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {forms.map((form) => (
        <motion.div key={form.id} variants={cardVariants}>
          <div className="group flex h-full flex-col rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 p-4 pb-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {form.title}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  /{form.slug}
                </p>
              </div>
              {statusBadge(form.status, form.visibility)}
            </div>

            {/* Body */}
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

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3">
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/forms/${form.id}`}>
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
              </Button>
              {form.status === "published" && username ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-xs"
                  onClick={() => copyLink(username, form.slug)}
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
                  {form.status === "published" && username ? (
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
      ))}
    </motion.div>
  );
}
