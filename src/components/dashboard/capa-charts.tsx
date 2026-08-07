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
import { capaPriorityEnum, statusEnum } from '@shared/schema';
import type { BreakdownItem, CapaStatsOutput } from '@shared/types/dashboard.types';
import { CAPA_PRIORITY_MAP } from '@shared/schema';
import { STATUS_MAP } from '@shared/schema';
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';

// Manual adaptation of STATUS_CHART_CONFIG to avoid type errors in prototype
const STATUS_CHART_CONFIG: ChartConfig = {
  open: { label: STATUS_MAP.open, color: '#ec7d10' }, // open - warning
  in_review: { label: STATUS_MAP.in_review, color: '#0c6ff9' }, // in_review - primary
  closed: { label: STATUS_MAP.closed, color: '#00875a' }, // closed - success
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#e01e5a', // high - destructive
  medium: '#ec7d10', // medium - warning
  low: '#0c6ff9', // low - primary
};

const buildPriorityChartConfig = (data: BreakdownItem[]): ChartConfig => {
  const config: ChartConfig = {};
  for (const item of data) {
    const key = item.label.toLowerCase();
    config[key] = {
      label: CAPA_PRIORITY_MAP[key as keyof typeof CAPA_PRIORITY_MAP] ?? item.label,
      color: PRIORITY_COLORS[key] ?? '#94a3b8',
    };
  }
  return config;
};

type CapaStatsExtended = CapaStatsOutput & {
  openCount: number;
  inReviewCount: number;
  closedCount: number;
  overdueCount: number;
};

type CapaStatusChartProps = {
  data: CapaStatsExtended | any;
  isLoading: boolean;
  avgDaysToClose?: number | null;
};

export const CapaStatusChart = ({ data, isLoading, avgDaysToClose }: CapaStatusChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CAPA Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data
    ? [
        { status: statusEnum.enumValues[0], label: STATUS_MAP.open, count: data.openCount || data.open || 0 },
        { status: statusEnum.enumValues[1], label: STATUS_MAP.in_review, count: data.inReviewCount || data.in_review || 0 },
        { status: statusEnum.enumValues[2], label: STATUS_MAP.closed, count: data.closedCount || data.closed || 0 },
      ].filter((d) => d.count > 0)
    : [];

  const overdueCount = data?.overdueCount ?? data?.overdue ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CAPA Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No CAPAs in this period</p>
        ) : (
          <ChartContainer config={STATUS_CHART_CONFIG} className="mx-auto aspect-square max-h-[280px]">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
                paddingAngle={3}
                cornerRadius={5}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={(STATUS_CHART_CONFIG[entry.status]?.color as string) ?? '#0c6ff9'}
                  />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        )}
        <div className="mt-4 flex flex-col items-center justify-center gap-1">
          {overdueCount > 0 && <p className="text-sm font-medium text-destructive">Overdue: {overdueCount}</p>}
          {avgDaysToClose != null && (
            <p className="text-xs text-muted-foreground">Avg Days to Close: {Math.ceil(avgDaysToClose)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

type CapaPriorityChartProps = {
  data: BreakdownItem[] | undefined;
  isLoading: boolean;
};

export const CapaPriorityChart = ({ data, isLoading }: CapaPriorityChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CAPAs by Priority</CardTitle>
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
          <CardTitle>CAPAs by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No CAPAs in this period</p>
        </CardContent>
      </Card>
    );
  }

  const config = buildPriorityChartConfig(chartData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>CAPAs by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(v) => CAPA_PRIORITY_MAP[v?.toLowerCase() as keyof typeof CAPA_PRIORITY_MAP] ?? v}
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
                    fill={PRIORITY_COLORS[key] ?? '#0c6ff9'}
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
