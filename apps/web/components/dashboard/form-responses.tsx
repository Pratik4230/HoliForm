"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Empty } from "~/components/ui/empty";
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
} from "~/hooks/api/response";
import { FieldAnalyticsCard } from "~/components/dashboard/field-analytics-card";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import {
  ResponseFilters,
  emptyResponseFilters,
  hasActiveResponseFilters,
  type ResponseFiltersState,
} from "~/components/dashboard/response-filters";
import { formatAnswerValue } from "~/lib/format-answer";
import { HOLI } from "~/components/auth/holi/holi-colors";

const PAGE_SIZE = 15;

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
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl border-border/70 bg-background/70 shadow-xl backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-70"
          style={{
            background: `linear-gradient(90deg, ${HOLI.pink}cc, ${HOLI.yellow}cc, ${HOLI.orange}cc)`,
          }}
          aria-hidden
        />
        <DialogHeader>
          <DialogTitle
            style={{
              background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange}, ${HOLI.yellow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Response details
          </DialogTitle>
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
                  <p className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm backdrop-blur-md">
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
  const [filters, setFilters] = useState<ResponseFiltersState>(emptyResponseFilters);

  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const debouncedFieldValue = useDebouncedValue(filters.fieldValue, 350);

  const queryFilters = useMemo(
    () => ({
      sort: filters.sort,
      search: debouncedSearch,
      submittedFrom: filters.submittedFrom,
      submittedTo: filters.submittedTo,
      fieldId: filters.fieldId,
      fieldValue: debouncedFieldValue,
    }),
    [
      filters.sort,
      filters.submittedFrom,
      filters.submittedTo,
      filters.fieldId,
      debouncedSearch,
      debouncedFieldValue,
    ],
  );

  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  const { data: formData, isLoading: formLoading } = useFormById(formId);
  const { data: analytics, isLoading: analyticsLoading } = useFormAnalytics(formId);
  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
  } = useResponsesByForm(formId, page, PAGE_SIZE, queryFilters);
  const { exportCsv, isExporting } = useExportResponsesByForm();

  if (formLoading || !formData) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const form = formData.form;
  const previewFields = [...formData.fields].sort((a, b) => Number(a.index) - Number(b.index));
  const totalPages = listData?.totalPages ?? 0;
  const filtersActive = hasActiveResponseFilters(filters);
  const hasAnyResponses = (analytics?.totalResponses ?? 0) > 0;
  const isInitialListLoading = listLoading && !listData;

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 h-10" asChild>
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeft className="size-4" />
              Back to editor
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{form.title}</h1>
          <p className="text-muted-foreground text-sm">Responses & analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant="secondary" className="text-sm">
            {analytics?.totalResponses ?? 0} total
          </Badge>
          <Button
            variant="outline"
            className="h-10"
            disabled={isExporting || (analytics?.totalResponses ?? 0) === 0}
            onClick={() => void exportCsv(formId)}
          >
            {isExporting ? <Spinner className="size-4" /> : <Download className="size-4" />}
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
              className="h-10 shrink-0 gap-1.5"
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

        {hasAnyResponses ? (
          <ResponseFilters
            fields={previewFields}
            filters={filters}
            isFetching={listFetching && !isInitialListLoading}
            onChange={setFilters}
          />
        ) : null}

        {isInitialListLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : !listData?.items.length ? (
          <Empty className="rounded-xl border border-dashed border-border py-16">
            <div className="mx-auto max-w-sm text-center">
              <p className="text-lg font-semibold">
                {filtersActive ? "No matching responses" : "No responses yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {filtersActive
                  ? "Try clearing filters or broadening your search."
                  : "Share your form link to start collecting answers."}
              </p>
              {filtersActive ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setFilters(emptyResponseFilters)}
                >
                  Clear filters
                </Button>
              ) : (
                <Button asChild className="mt-4" variant="outline">
                  <Link href={`/dashboard/forms/${formId}`}>Back to form</Link>
                </Button>
              )}
            </div>
          </Empty>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {listData.items.map((item) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-xl border border-border bg-card p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                  </p>
                  {previewFields.slice(0, 3).map((field) => (
                    <div key={field.id} className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                      <p className="mt-0.5 break-words text-sm">
                        {formatAnswerValue(item.preview[field.labelKey])}
                      </p>
                    </div>
                  ))}
                  <Button
                    className="h-10 w-full"
                    variant="outline"
                    onClick={() => setSelectedResponseId(item.id)}
                  >
                    View details
                  </Button>
                </div>
              ))}
            </div>

            <div className="hidden rounded-xl border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    {previewFields.slice(0, 3).map((field) => (
                      <TableHead key={field.id} className="max-w-[180px]">
                        <span className="line-clamp-2">{field.label}</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
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
                          className="h-9"
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

            {totalPages > 1 || listData.total > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-sm text-muted-foreground sm:text-left">
                  Page {listData.page} of {Math.max(totalPages, 1)} ({listData.total} matching
                  response{listData.total === 1 ? "" : "s"})
                </p>
                <div className="flex gap-2">
                  <Button
                    className="h-10 flex-1 sm:flex-none"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    className="h-10 flex-1 sm:flex-none"
                    variant="outline"
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
