"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { AnalyticsSummary } from "@/types";

const visitsConfig = {
  visits: { label: "Visits", color: "var(--chart-2)" },
} satisfies ChartConfig;

const hourlyConfig = {
  visits: { label: "Visits", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** The five chart tokens, cycled across pie slices and bars. */
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function chartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[13rem] items-center justify-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export function AnalyticsOverview({ summary }: { summary: AnalyticsSummary }) {
  const { totals, hourly, countries, sources } = summary;

  const hourlyData = hourly.map((bucket) => ({
    label: `${String(bucket.hour).padStart(2, "0")}:00`,
    visits: bucket.visits,
  }));

  // Keep the pie readable: the five biggest countries, everything else pooled.
  const topCountries = countries.slice(0, 5);
  const remaining = countries.slice(5).reduce((total, entry) => total + entry.visits, 0);
  const countryData = [
    ...topCountries,
    ...(remaining > 0 ? [{ label: "Other", visits: remaining }] : []),
  ];

  const sourceData = sources.slice(0, 6);

  const peak = hourly.reduce((best, bucket) => (bucket.visits > best.visits ? bucket : best), hourly[0]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-semibold text-lg tracking-tight">Today&rsquo;s traffic</h2>
          <p className="text-muted-foreground text-sm">
            Visits recorded on the public site for {summary.date}, bucketed by local hour.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Visits" value={totals.visits.toLocaleString()} hint={`vs ${totals.previousVisits} yesterday`} />
        <StatTile
          label="Unique visitors"
          value={totals.uniqueVisitors.toLocaleString()}
          hint={totals.visits > 0 ? `${Math.round((totals.uniqueVisitors / totals.visits) * 100)}% of visits` : undefined}
        />
        <StatTile
          label="Change vs yesterday"
          value={
            totals.changePercent === null
              ? "—"
              : `${totals.changePercent > 0 ? "+" : ""}${totals.changePercent}%`
          }
          hint={totals.changePercent === null ? "No traffic yesterday" : undefined}
        />
        <StatTile
          label="Busiest hour"
          value={totals.visits === 0 ? "—" : `${String(peak.hour).padStart(2, "0")}:00`}
          hint={totals.visits === 0 ? undefined : `${peak.visits} visits`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visits by hour</CardTitle>
          <CardDescription>Today&rsquo;s trend across the day.</CardDescription>
        </CardHeader>
        <CardContent>
          {totals.visits === 0 ? (
            <EmptyChart message="No visits recorded yet today." />
          ) : (
            <ChartContainer config={hourlyConfig} className="h-[13rem] w-full">
              <AreaChart data={hourlyData} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={3}
                  fontSize={12}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={40} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="visits"
                  type="monotone"
                  stroke="var(--color-visits)"
                  fill="var(--color-visits)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor locations</CardTitle>
            <CardDescription>Where today&rsquo;s visits came from.</CardDescription>
          </CardHeader>
          <CardContent>
            {countryData.length === 0 ? (
              <EmptyChart message="No location data yet." />
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <ChartContainer config={visitsConfig} className="h-[13rem] w-full sm:max-w-[13rem]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                    <Pie data={countryData} dataKey="visits" nameKey="label" innerRadius={44} outerRadius={68}>
                      {countryData.map((entry, index) => (
                        <Cell key={entry.label} fill={chartColor(index)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <ul className="w-full flex-1 space-y-2">
                  {countryData.map((entry, index) => (
                    <li key={entry.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ background: chartColor(index) }}
                        />
                        <span className="truncate">{entry.label}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground tabular-nums">{entry.visits}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Attribution across search, social and direct.</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceData.length === 0 ? (
              <EmptyChart message="No source data yet." />
            ) : (
              <ChartContainer config={visitsConfig} className="h-[13rem] w-full">
                <BarChart data={sourceData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="source"
                    tickLine={false}
                    axisLine={false}
                    width={84}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="visits" radius={4} fill="var(--color-visits)" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
