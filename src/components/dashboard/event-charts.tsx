import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { reportTypeEnum, severityEnum } from '@shared/schema';
import type { BreakdownItem } from '@shared/types/dashboard.types';
import { REPORT_TYPE_MAP, SEVERITY_MAP } from '@shared/schema';
import { Bar, BarChart, Cell, Label, Pie, PieChart, XAxis, YAxis } from 'recharts';

const EVENT_TYPE_COLORS: Record<string, string> = {
  incident: '#e01e5a', // incident - destructive
  near_miss: '#ec7d10', // near_miss - warning
  observation: '#0c6ff9', // observation - primary
  customer_incident: '#8b5cf6', // customer_incident - purple
};

const SEVERITY_COLORS: Record<string, string> = {
  low: '#0c6ff9', // low - primary
  medium: '#ec7d10', // medium - warning
  high: '#f97316', // high - orange
  critical: '#e01e5a', // critical - destructive
};

const buildTypeChartConfig = (data: BreakdownItem[]): ChartConfig => {
  const config: ChartConfig = {};
  for (const item of data) {
    const key = item.label.toLowerCase().replace(/\s+/g, '_');
    config[key] = {
      label: `${REPORT_TYPE_MAP[key as keyof typeof REPORT_TYPE_MAP] ?? item.label} (${item.count})`,
      color: EVENT_TYPE_COLORS[key] ?? '#94a3b8',
    };
  }
  return config;
};

const buildSeverityChartConfig = (data: BreakdownItem[]): ChartConfig => {
  const config: ChartConfig = {};
  for (const item of data) {
    const key = item.label.toLowerCase();
    config[key] = {
      label: SEVERITY_MAP[key as keyof typeof SEVERITY_MAP] ?? item.label,
      color: SEVERITY_COLORS[key] ?? '#94a3b8',
    };
  }
  return config;
};

type IncidentsByTypeChartProps = {
  data: BreakdownItem[] | undefined;
  isLoading: boolean;
};

export const IncidentsByTypeChart = ({ data, isLoading }: IncidentsByTypeChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.filter((d) => d.count > 0) ?? [];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No incidents in this period</p>
        </CardContent>
      </Card>
    );
  }

  const config = buildTypeChartConfig(chartData);
  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
              paddingAngle={3}
              cornerRadius={5}
            >
              {chartData.map((entry, index) => {
                const key = entry.label.toLowerCase().replace(/\s+/g, '_');
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={EVENT_TYPE_COLORS[key] ?? '#0c6ff9'}
                  />
                );
              })}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {total}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="label" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

type IncidentsBySeverityChartProps = {
  data: BreakdownItem[] | undefined;
  isLoading: boolean;
};

export const IncidentsBySeverityChart = ({ data, isLoading }: IncidentsBySeverityChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.filter((d) => d.count > 0) ?? [];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No incidents in this period</p>
        </CardContent>
      </Card>
    );
  }

  const config = buildSeverityChartConfig(chartData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Severity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(v) => SEVERITY_MAP[v?.toLowerCase() as keyof typeof SEVERITY_MAP] ?? v}
            />
            <YAxis allowDecimals={false} hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              label={{ position: 'top', fill: 'currentColor', fontSize: 12 }}
            >
              {chartData.map((entry, index) => {
                const key = entry.label.toLowerCase();
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={SEVERITY_COLORS[key] ?? '#0c6ff9'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
