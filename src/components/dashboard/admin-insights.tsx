"use client";

import { useMemo } from "react";
import { useAdminAnalytics, useAdminStats } from "@/hooks";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import {
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getAnalyticsSeries,
  getErrorMessage,
  getNumericMetrics,
  getDashboardPieBreakdown,
  isRecord,
  PageHeader,
  type AnalyticsSeries,
  QueryError,
  unwrapData,
} from "@/components/dashboard/admin-ui";

export default function AdminInsights({ mode }: { mode: "analytics" | "reports" }) {
  const statsQuery = useAdminStats();
  const analyticsQuery = useAdminAnalytics();
  const metrics = useMemo(() => getNumericMetrics(statsQuery.data), [statsQuery.data]);
  const analyticsChart = useMemo(
    () => getAnalyticsSeries(analyticsQuery.data),
    [analyticsQuery.data],
  );
  const summaryChart = useMemo<AnalyticsSeries | undefined>(
    () =>
      metrics.length
        ? {
            points: metrics.map((metric) => ({
              metric: metric.label,
              value: metric.amount,
            })),
            categoryKey: "metric",
            series: ["value"],
            sourceKey: "Dashboard summary",
          }
        : undefined,
    [metrics],
  );
  const chart = analyticsChart || summaryChart;
  const chartIsSummary = !analyticsChart && !!summaryChart;
  const dashboardBreakdown = useMemo(
    () => getDashboardPieBreakdown(metrics),
    [metrics],
  );
  const tables = useMemo(() => {
    const value = unwrapData(analyticsQuery.data);
    if (!isRecord(value)) return [];
    return Object.entries(value)
      .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]) && entry[1].length > 0)
      .map(([key, rows]) => ({
        key,
        rows: rows.filter(isRecord).slice(0, 12),
      }))
      .filter((table) => table.rows.length > 0);
  }, [analyticsQuery.data]);
  const isLoading = statsQuery.isLoading || analyticsQuery.isLoading;

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow={mode === "reports" ? "Insights" : "Platform intelligence"}
        title={mode === "reports" ? "Reports" : "Analytics"}
        description={
          mode === "reports"
            ? "A reporting view assembled from the existing dashboard and analytics API responses."
            : "Explore the categorized numeric series and summary values currently returned by the analytics services."
        }
      />

      {(statsQuery.isError || analyticsQuery.isError) && (
        <div className="grid gap-3">
          {statsQuery.isError && (
            <QueryError message={getErrorMessage(statsQuery.error)} onRetry={() => void statsQuery.refetch()} />
          )}
          {analyticsQuery.isError && (
            <QueryError message={getErrorMessage(analyticsQuery.error)} onRetry={() => void analyticsQuery.refetch()} />
          )}
        </div>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold">Available summary metrics</h2>
            <p className="mt-1 text-sm text-muted-foreground">Numeric values returned by the dashboard endpoint.</p>
          </div>
          <span className="text-xs text-muted-foreground">{metrics.length} metrics</span>
        </div>
        {statsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : statsQuery.isError ? null : metrics.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <AdminSurface key={metric.key} className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{new Intl.NumberFormat().format(metric.amount)}</p>
              </AdminSurface>
            ))}
          </div>
        ) : (
          <AdminSurface><EmptyState title="No numeric summary values" description="The dashboard response did not include numeric summary metrics." /></AdminSurface>
        )}
      </section>

      {mode === "analytics" && (
        <>
          {analyticsQuery.isLoading && !summaryChart ? (
            <AdminSurface className="h-[560px] animate-pulse rounded-[26px] bg-muted/50">
              <div className="h-full" aria-hidden="true" />
            </AdminSurface>
          ) : chart ? (
            <AnalyticsChart
              data={chart}
              title={chartIsSummary ? "Admin metrics" : undefined}
              summaryOnly={chartIsSummary}
              pieBreakdown={chartIsSummary ? dashboardBreakdown : undefined}
            />
          ) : (
            <AdminSurface>
              <EmptyState
                title="No chartable data returned"
                description="The analytics and dashboard endpoints did not return categorized numeric data to plot."
              />
            </AdminSurface>
          )}
        </>
      )}

      {mode === "reports" && (
        <section>
          <div className="mb-3">
            <h2 className="font-semibold">Analytics response tables</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tabular views of array data returned by the analytics endpoint.</p>
          </div>
          {analyticsQuery.isLoading ? (
            <AdminSurface className="p-5"><AdminSkeleton rows={4} /></AdminSurface>
          ) : analyticsQuery.isError ? null : tables.length ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {tables.map((table) => {
                const columns = Array.from(new Set(table.rows.flatMap((row) => Object.keys(row)))).slice(0, 6);
                return (
                  <AdminSurface key={table.key} className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                      <h3 className="font-semibold">{table.key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("_", " ")}</h3>
                      <span className="text-xs text-muted-foreground">{table.rows.length} rows shown</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="bg-muted/45 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column.replaceAll("_", " ")}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {table.rows.map((row, index) => (
                            <tr key={String(row.id ?? index)}>
                              {columns.map((column) => (
                                <td key={column} className="max-w-48 truncate px-4 py-3 text-muted-foreground">
                                  {formatCell(row[column])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AdminSurface>
                );
              })}
            </div>
          ) : (
            <AdminSurface><EmptyState title="No report tables returned" description="The analytics response did not include array data to summarize." /></AdminSurface>
          )}
        </section>
      )}

      {isLoading && <p className="sr-only" role="status">Loading analytics data</p>}
    </div>
  );
}

function formatCell(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "—";
  return "[structured data]";
}
