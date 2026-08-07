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
import type { EventStatsOutput } from '@shared/types/dashboard.types';
import { eachDayOfInterval, format, parse } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useId, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig: ChartConfig = {
  count: {
    label: 'Events',
    color: '#0c6ff9',
  },
};

type EventTrendChartProps = {
  data: EventStatsOutput['trend'] | undefined;
  isLoading: boolean;
  dateRange?: { from: Date; to: Date };
};

const fillMissingDays = (
  data: { date: string; count: number }[],
  dateRange: { from: Date; to: Date },
): { date: string; count: number }[] => {
  const countMap = new Map(data.map((d) => [d.date, d.count]));
  return eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).map((day) => {
    const key = format(day, 'yyyy-MM-dd');
    return { date: key, count: countMap.get(key) ?? 0 };
  });
};

export const EventTrendChart = ({ data, isLoading, dateRange }: EventTrendChartProps) => {
  const uid = useId();
  const fillCountId = `${uid}-fillCount`;

  const isSingleDay = useMemo(() => {
    if (!dateRange) return false;
    return Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) <= 1;
  }, [dateRange]);

  const chartData = useMemo(() => {
    const raw = data ?? [];
    if (raw.length === 0 || !dateRange || isSingleDay) return raw;
    const diffDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 31) return fillMissingDays(raw, dateRange);
    return raw;
  }, [data, dateRange, isSingleDay]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = (data ?? []).reduce((sum, d) => sum + d.count, 0);

  if (isSingleDay) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-baseline justify-between">
            <CardTitle>Event Trend</CardTitle>
            <span className="text-sm font-normal text-muted-foreground">{total} total</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="size-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold">{total}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {total === 1 ? 'incident' : 'incidents'} reported today
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Select a wider date range to see the trend over time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No trend data for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pb-0">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle>Event Trend</CardTitle>
          <span className="text-sm font-normal text-muted-foreground">{total} total</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={fillCountId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => {
                try {
                   const d = parse(v, 'yyyy-MM-dd', new Date());
                   return format(d, 'MMM d');
                } catch(e) {
                   return v;
                }
              }}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              fill={`url(#${fillCountId})`}
              strokeWidth={2}
              activeDot={{ r: 6, fill: 'var(--color-count)', stroke: 'var(--background)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
