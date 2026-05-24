"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Empty } from "~/components/ui/empty";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useFormById } from "~/hooks/api/form";
import {
  useExportResponsesByForm,
  useFormAnalytics,
  useResponseById,
  useResponsesByForm,
  type FieldAnalytics,
} from "~/hooks/api/response";
import { formatAnswerValue } from "~/lib/format-answer";

const PAGE_SIZE = 15;

function FieldAnalyticsCard({ field }: { field: FieldAnalytics }) {
  if (field.kind === "choice") {
    const entries = Object.entries(field.counts).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] ?? 1;

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{field.label}</CardTitle>
          <CardDescription>
            {field.totalAnswers} answer{field.totalAnswers === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No answers yet</p>
          ) : (
            entries.map(([choice, count]) => (
              <div key={choice} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate font-medium">{choice}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <Progress value={(count / max) * 100} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  if (field.kind === "number") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{field.label}</CardTitle>
          <CardDescription>Numeric field</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Min</p>
            <p className="text-lg font-semibold">{field.min ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg</p>
            <p className="text-lg font-semibold">
              {field.average !== null ? field.average.toFixed(1) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Max</p>
            <p className="text-lg font-semibold">{field.max ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (field.kind === "boolean") {
    const total = field.trueCount + field.falseCount || 1;
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{field.label}</CardTitle>
          <CardDescription>Yes / No</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Yes</span>
              <span>{field.trueCount}</span>
            </div>
            <Progress value={(field.trueCount / total) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>No</span>
              <span>{field.falseCount}</span>
            </div>
            <Progress value={(field.falseCount / total) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{field.label}</CardTitle>
        <CardDescription>
          {field.totalAnswers} text answer{field.totalAnswers === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {field.recentSamples.length === 0 ? (
          <p className="text-sm text-muted-foreground">No answers yet</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {field.recentSamples.map((sample, index) => (
              <li
                key={`${field.fieldId}-${index}`}
                className="rounded-md border border-border bg-muted/30 px-3 py-2"
              >
                {formatAnswerValue(sample)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ResponseDetailDialog({
  formId,
  responseId,
  open,
  onOpenChange,
}: {
  formId: string;
  responseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useResponseById(formId, responseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Response details</DialogTitle>
          <DialogDescription>
            {data?.response.submittedAt
              ? `Submitted ${formatDistanceToNow(new Date(data.response.submittedAt), { addSuffix: true })}`
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-4">
            {data.answers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No answers recorded.</p>
            ) : (
              data.answers.map((answer) => (
                <div key={answer.fieldId} className="space-y-1">
                  <p className="text-sm font-medium">{answer.label}</p>
                  <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                    {formatAnswerValue(answer.value)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function FormResponses({ formId }: { formId: string }) {
  const [page, setPage] = useState(1);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);

  const { data: formData, isLoading: formLoading } = useFormById(formId);
  const { data: analytics, isLoading: analyticsLoading } = useFormAnalytics(formId);
  const { data: listData, isLoading: listLoading } = useResponsesByForm(
    formId,
    page,
    PAGE_SIZE,
  );
  const { exportCsv, isExporting } = useExportResponsesByForm();

  if (formLoading || !formData) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const form = formData.form;
  const previewFields = [...formData.fields].sort(
    (a, b) => Number(a.index) - Number(b.index),
  );
  const totalPages = listData?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeft className="size-4" />
              Back to editor
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{form.title}</h1>
          <p className="text-muted-foreground text-sm">Responses & analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {analytics?.totalResponses ?? 0} total
          </Badge>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting || (analytics?.totalResponses ?? 0) === 0}
            onClick={() => void exportCsv(formId)}
          >
            {isExporting ? (
              <Spinner className="size-4" />
            ) : (
              <Download className="size-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <Collapsible open={overviewOpen} onOpenChange={setOverviewOpen} className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <BarChart3 className="size-5 shrink-0 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Overview</h2>
            {!overviewOpen && analytics ? (
              <span className="text-sm text-muted-foreground">
                {analytics.totalResponses} response
                {analytics.totalResponses === 1 ? "" : "s"}
                {analytics.fieldBreakdowns.length > 0
                  ? ` · ${analytics.fieldBreakdowns.length} field charts`
                  : ""}
              </span>
            ) : null}
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              aria-expanded={overviewOpen}
              aria-label={overviewOpen ? "Minimize overview" : "Expand overview"}
            >
              {overviewOpen ? (
                <>
                  <ChevronUp className="size-4" />
                  Minimize
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" />
                  Expand
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
          {analyticsLoading || !analytics ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total responses</CardDescription>
                    <CardTitle className="text-3xl">{analytics.totalResponses}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>First response</CardDescription>
                    <CardTitle className="text-base font-medium">
                      {analytics.firstResponseAt
                        ? formatDistanceToNow(new Date(analytics.firstResponseAt), {
                            addSuffix: true,
                          })
                        : "—"}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Latest response</CardDescription>
                    <CardTitle className="text-base font-medium">
                      {analytics.lastResponseAt
                        ? formatDistanceToNow(new Date(analytics.lastResponseAt), {
                            addSuffix: true,
                          })
                        : "—"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {analytics.fieldBreakdowns.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {analytics.fieldBreakdowns.map((field) => (
                    <FieldAnalyticsCard key={field.fieldId} field={field} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All responses</h2>
        {listLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : !listData?.items.length ? (
          <Empty className="rounded-xl border border-dashed border-border py-16">
            <div className="mx-auto max-w-sm text-center">
              <p className="text-lg font-semibold">No responses yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Share your form link to start collecting answers.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href={`/dashboard/forms/${formId}`}>Back to form</Link>
              </Button>
            </div>
          </Empty>
        ) : (
          <>
            <div className="rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    {previewFields.slice(0, 3).map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDistanceToNow(new Date(item.submittedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      {previewFields.slice(0, 3).map((field) => (
                        <TableCell key={field.id} className="max-w-[200px] truncate">
                          {formatAnswerValue(item.preview[field.labelKey])}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedResponseId(item.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {listData.page} of {totalPages} ({listData.total} responses)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <ResponseDetailDialog
        formId={formId}
        responseId={selectedResponseId}
        open={Boolean(selectedResponseId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedResponseId(null);
          }
        }}
      />
    </div>
  );
}
