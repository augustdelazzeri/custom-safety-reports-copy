import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { EventStatsOutput } from '@shared/types/dashboard.types';
import { useMemo } from 'react';
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';

const LOCATION_COLORS = [
  '#0c6ff9', // blue
  '#ec7d10', // orange
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f43f5e', // rose
  '#06b6d4', // cyan
];

const OTHERS_COLOR = '#94a3b8';

const MAX_VISIBLE = 7;
const MAX_LABEL_LENGTH = 16;

const truncateLabel = (label: string) =>
  label.length > MAX_LABEL_LENGTH ? `${label.slice(0, MAX_LABEL_LENGTH)}...` : label;

type ChartRow = { locationName: string; count: number };

type EventsByLocationChartProps = {
  data: EventStatsOutput['byLocation'] | undefined;
  isLoading: boolean;
  error?: Error | string | null;
};

export const EventsByLocationChart = ({ data, isLoading, error }: EventsByLocationChartProps) => {
  const chartData = useMemo<ChartRow[]>(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => b.count - a.count);

    if (sorted.length <= MAX_VISIBLE) return sorted;

    const top = sorted.slice(0, MAX_VISIBLE - 1);
    const othersCount = sorted.slice(MAX_VISIBLE - 1).reduce((sum, d) => sum + d.count, 0);
    const othersLocationCount = sorted.length - (MAX_VISIBLE - 1);

    return [...top, { locationName: `Others (${othersLocationCount})`, count: othersCount }];
  }, [data]);

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    for (const [i, item] of chartData.entries()) {
      const isOthers = item.locationName.startsWith('Others (');
      config[item.locationName] = {
        label: item.locationName,
        color: isOthers ? OTHERS_COLOR : LOCATION_COLORS[i % LOCATION_COLORS.length],
      };
    }
    return config;
  }, [chartData]);

  const chartHeight = Math.max(200, chartData.length * 40 + 20);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-destructive">{typeof error === 'string' ? error : error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No incidents for selected locations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Location</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: chartHeight, width: '100%' }}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, bottom: 0, left: 0 }}
          >
            <YAxis
              dataKey="locationName"
              type="category"
              tickLine={false}
              axisLine={false}
              width={120}
              tickFormatter={truncateLabel}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" hide allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
              label={{ position: 'right', fill: 'currentColor', fontSize: 12 }}
            >
              {chartData.map((item, index) => {
                const isOthers = item.locationName.startsWith('Others (');
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isOthers ? OTHERS_COLOR : LOCATION_COLORS[index % LOCATION_COLORS.length]}
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
