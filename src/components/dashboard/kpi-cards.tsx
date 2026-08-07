import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/contexts/app-context';
import { buildKpiRoute, filterVisibleKpiKeys, getKpiGridColClass } from '@/lib/dashboard-kpi-navigation';
import { cn } from '@/lib/utils';
import type { EventStatsOutput, KpiKey, KpiSummaryOutput } from '@shared/types/dashboard.types';
import { AlertTriangle, CalendarClock, ClipboardList, FileCheck, ShieldCheck } from 'lucide-react';
import { useCallback, useMemo, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

// Mock translation
const t = (key: string, options?: any) => {
  const map: Record<string, string> = {
    'dashboard.kpi.openIncidents.label': 'Open Incidents',
    'dashboard.kpi.overdueCapas.label': 'Overdue CAPAs',
    'dashboard.kpi.oshaReportable.label': 'OSHA Reportable',
    'dashboard.kpi.pendingReview.label': 'Pending Review',
    'dashboard.kpi.daysSinceEvent.label': 'Days Since Incident',
    'dashboard.kpi.daysSinceEventValue': `${options?.count} Days`,
  };
  return map[key] || key;
};

type KpiCardsProps = {
  data: KpiSummaryOutput | undefined;
  isLoading: boolean;
  dateRange?: { from: Date; to: Date };
  locationIds: string[];
  daysSinceIncident?: EventStatsOutput['daysSinceLastIncidentByLocation'];
  daysSinceLoading?: boolean;
  onPendingReviewClick?: () => void;
};

const KPI_ICON_BY_KEY = {
  openIncidents: AlertTriangle,
  overdueCapas: CalendarClock,
  oshaReportable: FileCheck,
  totalPendingReview: ClipboardList,
} as const satisfies Record<KpiKey, typeof AlertTriangle>;

const KPI_LABEL_KEY_BY_KEY = {
  openIncidents: 'dashboard.kpi.openIncidents.label',
  overdueCapas: 'dashboard.kpi.overdueCapas.label',
  oshaReportable: 'dashboard.kpi.oshaReportable.label',
  totalPendingReview: 'dashboard.kpi.pendingReview.label',
} as const satisfies Record<KpiKey, string>;

export const KpiCards = ({
  data,
  isLoading,
  dateRange,
  locationIds,
  daysSinceIncident,
  daysSinceLoading,
  onPendingReviewClick,
}: KpiCardsProps) => {
  const { isUsCompany } = useAppContext();
  const router = useRouter();
  const showDaysSince = daysSinceLoading !== undefined;
  const visibleKpiKeys = useMemo(() => filterVisibleKpiKeys(isUsCompany), [isUsCompany]);
  const gridCols = getKpiGridColClass(visibleKpiKeys.length + (showDaysSince ? 1 : 0));

  const handleKpiClick = useCallback(
    (key: KpiKey) => {
      if (key === 'totalPendingReview') {
        onPendingReviewClick?.();
        return;
      }
      const route = buildKpiRoute(key, dateRange, locationIds);
      if (route) {
        router.push(route);
      }
    },
    [dateRange, locationIds, router, onPendingReviewClick],
  );

  const handleKpiKeyDown = useCallback(
    (key: KpiKey, event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleKpiClick(key);
      }
    },
    [handleKpiClick],
  );

  const daysSinceValue = (() => {
    if (!daysSinceIncident?.length) return null;
    const validDays = daysSinceIncident.flatMap((d) => (d.daysSince != null ? [d.daysSince] : []));
    return validDays.length ? Math.min(...validDays) : null;
  })();

  if (isLoading || daysSinceLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-4', gridCols)}>
        {visibleKpiKeys.map((key) => (
          <Card key={key}>
            <CardContent className="pt-0">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
        {showDaysSince && (
          <Card>
            <CardContent className="pt-0">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4', gridCols)}>
      {visibleKpiKeys.map((key) => {
        const count = data?.[key] ?? 0;
        const isPositive = count === 0;
        const Icon = KPI_ICON_BY_KEY[key];
        const isInteractive = key !== 'totalPendingReview' || onPendingReviewClick != null;

        return (
          <Card
            key={key}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            className={cn(isInteractive && 'cursor-pointer transition-colors hover:bg-muted/50')}
            onClick={isInteractive ? () => handleKpiClick(key) : undefined}
            onKeyDown={isInteractive ? (event) => handleKpiKeyDown(key, event) : undefined}
          >
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t(KPI_LABEL_KEY_BY_KEY[key])}</span>
              </div>
              <p
                className={cn(
                  'mt-1 text-2xl font-semibold',
                  isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500',
                )}
              >
                {count}
              </p>
            </CardContent>
          </Card>
        );
      })}
      {showDaysSince && (
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('dashboard.kpi.daysSinceEvent.label')}</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">
              {daysSinceValue != null ? t('dashboard.kpi.daysSinceEventValue', { count: daysSinceValue }) : '—'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
