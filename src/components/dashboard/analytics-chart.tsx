"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, BarChart3, ChartPie, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AnalyticsSeries,
  DashboardPieBreakdown,
  PieCategory,
} from "@/components/dashboard/admin-ui";
import { cn } from "@/lib/utils";

const seriesColors = ["#078f7b", "#5578e8", "#d89132", "#9670df", "#d15d78"];
const pieColors = ["#078f7b", "#5578e8", "#d89132", "#9670df", "#d15d78", "#55a9c4", "#8a9b58"];
type ChartMode = "bar" | "area" | "line" | "pie";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function displayName(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function AnalyticsChart({
  data,
  title,
  summaryOnly = false,
  pieBreakdown,
}: {
  data: AnalyticsSeries;
  title?: string;
  summaryOnly?: boolean;
  pieBreakdown?: DashboardPieBreakdown;
}) {
  const [mode, setMode] = useState<ChartMode>("bar");
  const [visibleSeries, setVisibleSeries] = useState<string[]>(data.series);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const allVisible = visibleSeries.length === data.series.length;
  const selectedPieSeries = visibleSeries[0] ?? data.series[0];

  const chartPieData = useMemo(() => {
    if (pieBreakdown) return pieBreakdown.categories;
    if (!selectedPieSeries) return [];
    return data.points
      .map((point) => {
        const name = point[data.categoryKey];
        const value = point[selectedPieSeries];
        return typeof name !== "undefined" && typeof value === "number" && value > 0
          ? { name: String(name), value }
          : undefined;
      })
      .filter((item): item is PieCategory => item !== undefined);
  }, [data, pieBreakdown, selectedPieSeries]);
  const visiblePieData = chartPieData.filter((item) => !hiddenCategories.includes(item.name));
  const pieTotal = visiblePieData.reduce((sum, item) => sum + item.value, 0);
  const chartModes: Array<{ id: ChartMode; label: string; icon: typeof BarChart3 }> = [
    { id: "bar", label: "Compare", icon: BarChart3 },
    ...(!summaryOnly
      ? [
          { id: "area" as const, label: "Area", icon: TrendingUp },
          { id: "line" as const, label: "Line", icon: Activity },
        ]
      : []),
    ...(chartPieData.length >= 2
      ? [{ id: "pie" as const, label: "Pie", icon: ChartPie }]
      : []),
  ];

  useEffect(() => {
    setVisibleSeries(data.series);
    setHiddenCategories([]);
  }, [data]);

  useEffect(() => {
    const modeAvailable =
      mode === "bar" ||
      (!summaryOnly && (mode === "area" || mode === "line")) ||
      (mode === "pie" && chartPieData.length >= 2);
    if (!modeAvailable) setMode("bar");
  }, [chartPieData.length, mode, summaryOnly]);

  const toggleSeries = (series: string) => {
    setVisibleSeries((current) =>
      current.includes(series)
        ? current.filter((item) => item !== series)
        : [...current, series],
    );
  };
  const toggleCategory = (name: string) => {
    setHiddenCategories((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const renderTrendSeries = () =>
    data.series.map((series, index) => {
      if (!visibleSeries.includes(series)) return null;
      const color = seriesColors[index % seriesColors.length];
      if (mode === "area") {
        return (
          <Area
            key={series}
            type="monotone"
            dataKey={series}
            name={series}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#analytics-fill-${index})`}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            dot={data.points.length <= 12 ? { r: 3, strokeWidth: 2, fill: "var(--card)" } : false}
            connectNulls
            animationDuration={700}
          />
        );
      }
      return (
        <Line
          key={series}
          type="monotone"
          dataKey={series}
          name={series}
          stroke={color}
          strokeWidth={2.5}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
          dot={data.points.length <= 12 ? { r: 3, strokeWidth: 2, fill: "var(--card)" } : false}
          connectNulls
          animationDuration={700}
        />
      );
    });

  return (
    <section className="overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-sm">
      <div className="relative isolate overflow-hidden border-b border-border/70 px-5 py-5 sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-72 w-72 rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
                {summaryOnly ? "Platform snapshot" : "Performance trends"}
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                API data
              </span>
            </div>
            <h2 className="mt-4 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {title || displayName(data.sourceKey)}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {summaryOnly
                ? `Compare ${data.points.length} numeric dashboard metrics returned by the API.`
                : `Explore ${data.series.length} numeric ${data.series.length === 1 ? "measure" : "measures"} across ${data.points.length} categories returned by the analytics API.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start">
            <div className="flex items-center rounded-xl border border-border bg-background/80 p-1 shadow-sm">
              {chartModes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={mode === id}
                  onClick={() => setMode(id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition sm:px-3",
                    mode === id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryTile label="Categories" value={String(data.points.length)} />
          <SummaryTile label="Measures" value={String(data.series.length)} />
          <SummaryTile
            label={mode === "pie" ? "Visible total" : "Visible measures"}
            value={mode === "pie" ? new Intl.NumberFormat().format(pieTotal) : `${visibleSeries.length} / ${data.series.length}`}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </div>

      <div className="px-3 pb-5 pt-4 sm:px-6 sm:pb-6">
        {mode === "pie" ? (
          <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
            <div className="relative mx-auto h-[280px] w-full max-w-[420px] sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === "number" ? new Intl.NumberFormat().format(value) : String(value ?? "—"),
                      String(name),
                    ]}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                      boxShadow: "0 12px 32px rgb(15 23 42 / 0.12)",
                    }}
                  />
                  <Pie
                    data={visiblePieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="64%"
                    outerRadius="88%"
                    paddingAngle={visiblePieData.length > 1 ? 4 : 0}
                    stroke="var(--card)"
                    strokeWidth={3}
                    cornerRadius={5}
                    animationDuration={750}
                  >
                    {visiblePieData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={pieColors[chartPieData.findIndex((category) => category.name === item.name) % pieColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {pieBreakdown?.title || displayName(selectedPieSeries || "Value")}
                </span>
                <span className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  {formatNumber(pieTotal)}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">visible total</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="mb-3">
                <h3 className="text-sm font-semibold">Category breakdown</h3>
                <p className="mt-1 text-xs text-muted-foreground">Select categories to include or exclude them from the chart.</p>
              </div>
              {chartPieData.map((item, index) => {
                const hidden = hiddenCategories.includes(item.name);
                const percent = pieTotal > 0 ? (item.value / pieTotal) * 100 : 0;
                return (
                  <button
                    key={item.name}
                    type="button"
                    aria-pressed={!hidden}
                    onClick={() => toggleCategory(item.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                      hidden ? "border-transparent bg-muted/40 opacity-55" : "border-border/70 bg-background hover:bg-muted/40",
                    )}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                    <span className="text-right">
                      <span className="block text-sm font-semibold tabular-nums">{new Intl.NumberFormat().format(item.value)}</span>
                      <span className="block text-[10px] text-muted-foreground">{percent.toFixed(1)}%</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs font-medium text-muted-foreground">
                {summaryOnly ? "Dashboard metrics" : "Category"}:{" "}
                <span className="font-semibold text-foreground">{displayName(data.categoryKey)}</span>
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-primary transition hover:text-primary/75"
                onClick={() => setVisibleSeries(allVisible ? [] : data.series)}
              >
                {allVisible ? "Hide all measures" : "Show all measures"}
              </button>
            </div>

            <div className="h-[300px] min-w-0 sm:h-[360px]">
              {visibleSeries.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                  Select a measure below to display it
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {summaryOnly ? (
                    <BarChart
                      data={data.points}
                      layout="vertical"
                      margin={{ top: 8, right: 22, left: 14, bottom: 4 }}
                      barCategoryGap="28%"
                    >
                      <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 6" />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatNumber}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey={data.categoryKey}
                        axisLine={false}
                        tickLine={false}
                        width={136}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--muted)", fillOpacity: 0.55 }}
                        formatter={(value) => [
                          typeof value === "number" ? new Intl.NumberFormat().format(value) : String(value ?? "—"),
                          "Value",
                        ]}
                        contentStyle={{
                          borderRadius: 14,
                          border: "1px solid var(--border)",
                          background: "var(--card)",
                          color: "var(--foreground)",
                          boxShadow: "0 12px 32px rgb(15 23 42 / 0.12)",
                        }}
                      />
                      <Bar
                        dataKey={visibleSeries[0]}
                        name="Value"
                        fill={seriesColors[0]}
                        radius={[0, 7, 7, 0]}
                        maxBarSize={28}
                        animationDuration={750}
                      />
                    </BarChart>
                  ) : (
                    <ChartForSeries
                      mode={mode}
                      data={data}
                      series={visibleSeries}
                      renderSeries={renderTrendSeries}
                    />
                  )}
                </ResponsiveContainer>
              )}
              {summaryOnly && chartPieData.length < 2 && (
                <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                  A pie chart will appear when the API returns a complete, non-zero status or user-role breakdown.
                </p>
              )}
            </div>

            {!summaryOnly && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                {data.series.map((series, index) => {
                  const active = visibleSeries.includes(series);
                  return (
                    <button
                      key={series}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleSeries(series)}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                        active
                          ? "border-border bg-background text-foreground shadow-sm"
                          : "border-transparent bg-muted/50 text-muted-foreground opacity-70 hover:opacity-100",
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full ring-2 ring-background"
                        style={{ backgroundColor: seriesColors[index % seriesColors.length] }}
                      />
                      {displayName(series)}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ChartForSeries({
  mode,
  data,
  series,
  renderSeries,
}: {
  mode: "area" | "line" | "bar" | "pie";
  data: AnalyticsSeries;
  series: string[];
  renderSeries: () => ReactNode;
}) {
  if (mode === "bar") {
    return (
      <BarChart data={data.points} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
        <XAxis dataKey={data.categoryKey} axisLine={false} tickLine={false} tickMargin={12} minTickGap={24} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} width={50} tickFormatter={formatNumber} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <Tooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
          formatter={(value, name) => [typeof value === "number" ? new Intl.NumberFormat().format(value) : String(value ?? "—"), displayName(String(name))]}
          contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", boxShadow: "0 12px 32px rgb(15 23 42 / 0.12)" }}
        />
        {series.map((item) => (
          <Bar key={item} dataKey={item} name={item} fill={seriesColors[data.series.indexOf(item) % seriesColors.length]} radius={[5, 5, 0, 0]} maxBarSize={38} animationDuration={700} />
        ))}
      </BarChart>
    );
  }

  const Chart = mode === "area" ? AreaChart : LineChart;
  return (
    <Chart data={data.points} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
      {mode === "area" && (
        <defs>
          {data.series.map((item, index) => (
            <linearGradient key={item} id={`analytics-fill-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColors[index % seriesColors.length]} stopOpacity={0.24} />
              <stop offset="88%" stopColor={seriesColors[index % seriesColors.length]} stopOpacity={0.015} />
            </linearGradient>
          ))}
        </defs>
      )}
      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" strokeOpacity={0.8} />
      <XAxis dataKey={data.categoryKey} axisLine={false} tickLine={false} tickMargin={12} minTickGap={24} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
      <YAxis axisLine={false} tickLine={false} tickMargin={10} width={50} tickFormatter={formatNumber} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
      <Tooltip
        cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4", strokeOpacity: 0.35 }}
        contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", boxShadow: "0 12px 32px rgb(15 23 42 / 0.12)", padding: "10px 14px" }}
        labelStyle={{ color: "var(--muted-foreground)", fontSize: 11, marginBottom: 6 }}
        itemStyle={{ fontSize: 12, paddingTop: 2, paddingBottom: 2 }}
        formatter={(value, name) => [typeof value === "number" ? new Intl.NumberFormat().format(value) : String(value ?? "—"), displayName(String(name))]}
        labelFormatter={(label) => `${displayName(data.categoryKey)} · ${String(label)}`}
      />
      {renderSeries()}
    </Chart>
  );
}

function SummaryTile({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border/70 bg-background/75 px-3.5 py-3 sm:px-4", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
