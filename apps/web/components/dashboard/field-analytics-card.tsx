"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import type { FieldAnalytics } from "~/hooks/api/response";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { formatAnswerValue } from "~/lib/format-answer";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function chartKey(label: string, index: number) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return slug || `option_${index}`;
}

function buildChoiceChartData(counts: Record<string, number>) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count], index) => ({
      key: chartKey(label, index),
      label,
      count,
    }));
}

function buildChartConfig(items: { key: string; label: string }[]): ChartConfig {
  return items.reduce<ChartConfig>((config, item, index) => {
    config[item.key] = {
      label: item.label,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return config;
  }, {});
}

function ChoiceAnalyticsChart({ field }: { field: Extract<FieldAnalytics, { kind: "choice" }> }) {
  const [view, setView] = useState<"bar" | "pie">("bar");

  const data = useMemo(() => buildChoiceChartData(field.counts), [field.counts]);
  const chartConfig = useMemo(() => buildChartConfig(data), [data]);
  const canUsePie = data.length > 0 && data.length <= 6;

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No answers yet</p>;
  }

  return (
    <div className="space-y-3">
      {canUsePie ? (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === "bar" ? "default" : "outline"}
            onClick={() => setView("bar")}
          >
            Bar
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "pie" ? "default" : "outline"}
            onClick={() => setView("pie")}
          >
            Pie
          </Button>
        </div>
      ) : null}

      <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
        {view === "pie" && canUsePie ? (
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="key"
              innerRadius={48}
              outerRadius={84}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="key"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={56}
              tickMargin={8}
              tickFormatter={(value: string) => {
                const label = chartConfig[value]?.label;
                if (typeof label !== "string") {
                  return value;
                }
                return label.length > 14 ? `${label.slice(0, 12)}…` : label;
              }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="key"
                  labelFormatter={(_, payload) => {
                    const key = payload?.[0]?.payload?.key as string | undefined;
                    return key ? String(chartConfig[key]?.label ?? key) : "";
                  }}
                />
              }
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ChartContainer>

      <div className="grid gap-1 text-sm">
        {data.map((entry) => (
          <div key={entry.key} className="flex justify-between gap-2">
            <span className="truncate">{entry.label}</span>
            <span className="shrink-0 text-muted-foreground">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BooleanAnalyticsChart({ field }: { field: Extract<FieldAnalytics, { kind: "boolean" }> }) {
  const data = useMemo(
    () => [
      { key: "yes", label: "Yes", count: field.trueCount },
      { key: "no", label: "No", count: field.falseCount },
    ],
    [field.falseCount, field.trueCount],
  );

  const chartConfig = useMemo(
    () =>
      ({
        yes: { label: "Yes", color: "var(--chart-2)" },
        no: { label: "No", color: "var(--chart-5)" },
      }) satisfies ChartConfig,
    [],
  );

  const total = field.trueCount + field.falseCount;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No answers yet</p>;
  }

  return (
    <div className="space-y-3">
      <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="key"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        {data.map((entry) => (
          <div key={entry.key} className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-muted-foreground">{entry.label}</p>
            <p className="text-lg font-semibold">{entry.count}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round((entry.count / total) * 100)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FieldAnalyticsCard({ field }: { field: FieldAnalytics }) {
  if (field.kind === "choice") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{field.label}</CardTitle>
          <CardDescription>
            {field.totalAnswers} answer{field.totalAnswers === 1 ? "" : "s"} ·{" "}
            {field.type.replace("multiselect", "multi-select")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChoiceAnalyticsChart field={field} />
        </CardContent>
      </Card>
    );
  }

  if (field.kind === "boolean") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{field.label}</CardTitle>
          <CardDescription>Yes / No checkbox</CardDescription>
        </CardHeader>
        <CardContent>
          <BooleanAnalyticsChart field={field} />
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
        <CardContent className="grid grid-cols-3 gap-2 text-center text-sm sm:gap-3">
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
