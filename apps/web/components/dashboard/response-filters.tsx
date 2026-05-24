"use client";

import { Search, X } from "lucide-react";
import type { ListResponsesSort } from "@repo/validators/forms";
import type { EditorField } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type ResponseFiltersState = {
  sort: ListResponsesSort;
  search: string;
  submittedFrom: string;
  submittedTo: string;
  fieldId: string;
  fieldValue: string;
};

export const emptyResponseFilters: ResponseFiltersState = {
  sort: "newest",
  search: "",
  submittedFrom: "",
  submittedTo: "",
  fieldId: "",
  fieldValue: "",
};

export function hasActiveResponseFilters(filters: ResponseFiltersState) {
  return (
    filters.search.trim().length > 0 ||
    filters.submittedFrom.length > 0 ||
    filters.submittedTo.length > 0 ||
    filters.fieldId.length > 0 ||
    filters.fieldValue.trim().length > 0 ||
    filters.sort !== "newest"
  );
}

type ResponseFiltersProps = {
  fields: EditorField[];
  filters: ResponseFiltersState;
  onChange: (filters: ResponseFiltersState) => void;
  isFetching?: boolean;
};

export function ResponseFilters({
  fields,
  filters,
  onChange,
  isFetching,
}: ResponseFiltersProps) {
  const sortedFields = [...fields].sort((a, b) => Number(a.index) - Number(b.index));

  const update = (patch: Partial<ResponseFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  const clearFilters = () => {
    onChange(emptyResponseFilters);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">Filter responses</p>
          <p className="text-sm text-muted-foreground">
            Search and date filters update automatically after you pause typing.
          </p>
        </div>
        {hasActiveResponseFilters(filters) ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 md:col-span-2 xl:col-span-2">
          <Label htmlFor="response-search">Search answers</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="response-search"
              value={filters.search}
              placeholder="Search across all fields…"
              className="pl-9"
              onChange={(event) => update({ search: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-sort">Sort</Label>
          <Select
            value={filters.sort}
            onValueChange={(value: ListResponsesSort) => update({ sort: value })}
          >
            <SelectTrigger id="response-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-from">From date</Label>
          <Input
            id="response-from"
            type="date"
            value={filters.submittedFrom}
            onChange={(event) => update({ submittedFrom: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-to">To date</Label>
          <Input
            id="response-to"
            type="date"
            value={filters.submittedTo}
            onChange={(event) => update({ submittedTo: event.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="response-field">Field</Label>
          <Select
            value={filters.fieldId || "all"}
            onValueChange={(value) =>
              update({
                fieldId: value === "all" ? "" : value,
                fieldValue: value === "all" ? "" : filters.fieldValue,
              })
            }
          >
            <SelectTrigger id="response-field">
              <SelectValue placeholder="All fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fields</SelectItem>
              {sortedFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="response-field-value">Field value contains</Label>
          <Input
            id="response-field-value"
            value={filters.fieldValue}
            placeholder={filters.fieldId ? "Match answer text…" : "Select a field first"}
            disabled={!filters.fieldId}
            onChange={(event) => update({ fieldValue: event.target.value })}
          />
        </div>
      </div>

      {isFetching ? (
        <p className="text-xs text-muted-foreground">Updating results…</p>
      ) : null}
    </div>
  );
}
