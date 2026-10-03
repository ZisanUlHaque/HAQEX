import { Activity, CheckCircle2, Package, Star, Truck } from "lucide-react";
import { getNumericMetrics, isRecord, unwrapData, type NumericMetric } from "@/components/dashboard/admin-ui";
import { cn } from "@/lib/utils";

const metricIcons = [Package, Truck, CheckCircle2, Star, Activity];

export function getCourierMetrics(value: unknown): NumericMetric[] {
  const isInaccurateMetric = (metric: NumericMetric) =>
    ["currentactive", "deliverysuccessrate"].includes(metric.key.toLowerCase().replaceAll("_", ""));
  const metrics = getNumericMetrics(value).filter((metric) => !isInaccurateMetric(metric));
  const response = unwrapData(value);
  if (!isRecord(response)) return metrics;

  for (const [key, metricValue] of Object.entries(response)) {
    if (!/(successrate|deliveryrate)$/i.test(key) || typeof metricValue !== "string") continue;
    const percentage = /^(\d+(?:\.\d+)?)%$/.exec(metricValue.trim());
    if (!percentage) continue;
    metrics.push({
      key,
      label: key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase()),
      amount: Number(percentage[1]),
    });
  }
  return metrics.filter((metric) => !isInaccurateMetric(metric));
}

export function CourierMetrics({ metrics }: { metrics: NumericMetric[] }) {
  if (metrics.length === 0) return null;

  return (
    <section aria-label="Courier performance metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {metrics.slice(0, 8).map((metric, index) => {
        const Icon = metricIcons[index % metricIcons.length];
        return (
          <article
            key={metric.key}
            className="group rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(metric.amount)}
              {/rate$/i.test(metric.key) ? "%" : ""}
            </p>
            <p className={cn("mt-1 text-xs font-medium text-muted-foreground sm:text-sm")}>{metric.label}</p>
          </article>
        );
      })}
    </section>
  );
}
