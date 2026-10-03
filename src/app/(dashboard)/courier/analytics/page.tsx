"use client";

import {
  AdminSkeleton,
  getAnalyticsSeries,
  getErrorMessage,
  QueryError,
  unwrapData,
} from "@/components/dashboard/admin-ui";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import { CourierMetrics, getCourierMetrics } from "@/components/dashboard/courier-metrics";
import { useCourierAnalytics } from "@/hooks";

export default function CourierAnalyticsPage() {
  const analytics = useCourierAnalytics();
  const metrics = getCourierMetrics(analytics.data);
  const series = getAnalyticsSeries(analytics.data);
  const hasResponse = unwrapData(analytics.data) !== undefined && unwrapData(analytics.data) !== null;

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Performance</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Courier analytics</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Performance measures and trends returned for your courier account.
        </p>
      </header>

      {analytics.isError ? (
        <QueryError message={getErrorMessage(analytics.error)} onRetry={() => void analytics.refetch()} />
      ) : analytics.isLoading ? (
        <AdminSkeleton rows={4} />
      ) : (
        <>
          <CourierMetrics metrics={metrics} />
          <p className="text-xs text-muted-foreground">
            Active-workload and success-rate figures are withheld because the current analytics response does not consistently account for every active shipment stage.
          </p>
          {series && <AnalyticsChart data={series} title="Delivery activity" />}
          {metrics.length === 0 && !series && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
              <p className="font-medium">
                {hasResponse ? "No chartable performance metrics" : "No analytics available"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasResponse
                  ? "The current response contains no numeric measures or time-series data to visualize."
                  : "The analytics service did not return courier performance data."}
              </p>
            </div>
          )}
          {metrics.length > 0 && !series && (
            <div className="rounded-2xl border border-border/80 bg-card px-5 py-6 text-sm text-muted-foreground">
              No trend series was included in this response. The figures above reflect the available API metrics.
            </div>
          )}
        </>
      )}
    </div>
  );
}
