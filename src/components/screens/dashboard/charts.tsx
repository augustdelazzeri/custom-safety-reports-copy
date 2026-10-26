"use client";

/**
 * The dashboard's charts, after the redesign's lab-chart.tsx, drawn with recharts.
 *
 * Same colour decision as the redesign: magnitude is ONE hue (chart-1). Bars already separate
 * categories by position and every bar carries its label and its number, so a second hue would
 * carry nothing. Colour is spent only where it is a scale people already read: severity, from
 * low to critical, on Safety's chart ramp (chart-1, chart-4, amber-11, chart-5).
 */

import { useId } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type Tone = "neutral" | "good" | "warning" | "serious" | "critical";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Only where the category IS a severity or a status. */
  tone?: Tone;
}

const TONE_FILL: Record<Tone, string> = {
  neutral: "var(--chart-1)",
  good: "var(--chart-3)",
  warning: "var(--chart-4)",
  serious: "var(--amber-11)",
  critical: "var(--chart-5)",
};

const TICK = { fill: "var(--muted-foreground)", fontSize: 14 };

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** What one value means, in words: "3 events", "$9,400". */
export const valueText = (value: number, unit: string) => (unit === "currency" ? money(value) : `${value} ${value === 1 ? unit.replace(/s$/, "") : unit}`);

/** The redesign's tooltip: dark, small, names the point. */
function Tip({ label, value, unit }: { label?: string; value?: number; unit: string }) {
  if (label === undefined || value === undefined) return null;
  return (
    <div className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-sm">
      <span className="font-medium">{label}</span>
      <span className="opacity-80"> · {valueText(value, unit)}</span>
    </div>
  );
}

function Blank() {
  return <p className="px-4 py-10 text-center text-sm text-muted-foreground">—</p>;
}

/**
 * Horizontal bars: the right form when categories have names to read. The name on the left, a
 * 10px bar on a pale track, the number in its own column on the right.
 */
export function DashBars({ data, unit = "events" }: { data: BarDatum[]; unit?: string }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) return <Blank />;
  const rows = data.map((d) => ({ ...d, shown: unit === "currency" ? money(d.value) : String(d.value) }));
  const max = Math.max(...data.map((d) => d.value), 1);
  const nameWidth = unit === "currency" ? 150 : 170;
  const valueWidth = unit === "currency" ? 76 : 44;
  return (
    <div className="px-4 pt-2 pb-3" role="img" aria-label={data.map((d) => `${d.label}: ${valueText(d.value, unit)}`).join(", ")}>
      <ResponsiveContainer width="100%" height={rows.length * 38 + 4}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={14}>
          <XAxis type="number" hide domain={[0, max]} />
          {/* Names read from the left edge, numbers end at the right edge, as in the redesign's rows. */}
          <YAxis
            yAxisId="name"
            type="category"
            dataKey="label"
            width={nameWidth}
            axisLine={false}
            tickLine={false}
            tickSize={0}
            tickMargin={0}
            tick={{ ...TICK, textAnchor: "start", dx: -nameWidth }}
            interval={0}
          />
          <YAxis
            yAxisId="value"
            orientation="right"
            type="category"
            dataKey="shown"
            allowDuplicatedCategory
            width={valueWidth}
            axisLine={false}
            tickLine={false}
            tickSize={0}
            tickMargin={0}
            tick={{ fill: "var(--foreground)", fontSize: 14, fontWeight: 500, textAnchor: "end", dx: valueWidth }}
            interval={0}
          />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={({ active, payload }) => (active && payload?.[0] ? <Tip label={String(payload[0].payload.label)} value={Number(payload[0].payload.value)} unit={unit} /> : null)} />
          <Bar yAxisId="name" dataKey="value" barSize={10} radius={5} background={{ fill: "var(--color-surface-subtle)", radius: 5 }} isAnimationActive={false} minPointSize={(v) => (Number(v) > 0 ? 3 : 0)}>
            {rows.map((d) => (
              <Cell key={d.key} fill={TONE_FILL[d.tone ?? "neutral"]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** One series over time: a 2px line, a soft fill under it, the last point marked, a crosshair on hover. */
export function DashTrend({ points, unit = "events", height = 180 }: { points: { label: string; value: number }[]; unit?: string; height?: number }) {
  const gradient = `trend-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (points.length < 2) return <Blank />;
  const last = points.length - 1;
  return (
    <div className="px-2 pt-2 pb-4" role="img" aria-label={points.map((p) => `${p.label}: ${valueText(p.value, unit)}`).join(", ")}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK} tickMargin={10} interval="preserveStartEnd" minTickGap={48} />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={TICK}
            width={unit === "currency" ? 64 : 36}
            tickFormatter={(v: number) => (unit === "currency" ? (v === 0 ? "$0" : `$${Number((v / 1000).toFixed(1))}k`) : String(v))}
          />
          <Tooltip cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }} content={({ active, payload, label }) => (active && payload?.[0] ? <Tip label={String(label)} value={Number(payload[0].value)} unit={unit} /> : null)} />
          <Area
            type="linear"
            dataKey="value"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill={`url(#${gradient})`}
            isAnimationActive={false}
            dot={(p: { index?: number; cx?: number; cy?: number }) =>
              p.index === last && p.cx !== undefined && p.cy !== undefined ? <circle key="last" cx={p.cx} cy={p.cy} r={4} fill="var(--chart-1)" stroke="var(--card)" strokeWidth={2} /> : <g key={`d${p.index}`} />
            }
            activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
