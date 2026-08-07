"use client";

import { CapaPriorityChart, CapaStatusChart } from '@/components/dashboard/capa-charts';
import { DocumentStatusTable } from '@/components/dashboard/document-status-table';
import { IncidentsByTypeChart, IncidentsBySeverityChart } from '@/components/dashboard/event-charts';
import { EventsByLocationChart } from '@/components/dashboard/events-by-location';
import { EventTrendChart } from '@/components/dashboard/event-trend';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { AsyncLocationsFilter } from '@/components/composite/async-locations-filter';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppContext } from '@/contexts/app-context';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSION_KEYS } from '@shared/types/permissions.types';
import { useDashboardUrlFilters } from '@/hooks/use-url-filters';
import { cn } from '@/lib/utils';
import { trpc } from '@/providers/trpc';
import type { DashboardDatePreset } from '@shared/types/dashboard.types';
import {
  addDays,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
} from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

type DateRangePresetKey = Exclude<DashboardDatePreset, 'custom' | 'all'>;

type QuickPresetKey = Exclude<DashboardDatePreset, 'custom'>;

const QUICK_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'all', label: 'All Time' },
] as const satisfies readonly { key: QuickPresetKey; label: string }[];

const getDateRange = (preset: DateRangePresetKey): { from: Date; to: Date } => {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'week':
      return { from: startOfWeek(now), to: endOfWeek(now) };
    case 'month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'quarter':
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
};

export default function Dashboard() {
  const { user } = useAppContext();
  const { hasPermission } = usePermissions();
  const { immediateFilters, updateFilter, updateFilters } = useDashboardUrlFilters();

  const datePreset = immediateFilters.datePreset ?? 'week';
  const customRange =
    datePreset === 'custom' && (immediateFilters as any).customDateRange?.from && (immediateFilters as any).customDateRange?.to
      ? { from: (immediateFilters as any).customDateRange.from, to: (immediateFilters as any).customDateRange.to }
      : null;
  const locationIds = immediateFilters.locationIds ?? [];
  const scope = immediateFilters.scope ?? 'org';

  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [highlightDocuments, setHighlightDocuments] = useState(false);

  useEffect(() => {
    if (!highlightDocuments) return;
    const timer = window.setTimeout(() => setHighlightDocuments(false), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightDocuments]);

  const hasDashboardView = hasPermission(PERMISSION_KEYS.DASHBOARD_VIEW);
  const hasFullAccess = user?.hasPartialAccess === false;
  const effectiveScope = scope;

  const filters = useMemo(() => {
    const base = { scope: effectiveScope, locationIds: locationIds.length > 0 ? locationIds : undefined };
    if (datePreset === 'all') {
      return { ...base, dateRange: undefined };
    }
    if (datePreset === 'custom' && customRange) {
      return { ...base, dateRange: customRange };
    }
    const presetKey: any = datePreset === 'custom' ? 'month' : datePreset;
    const { from, to } = getDateRange(presetKey);
    return { ...base, dateRange: { from, to } };
  }, [datePreset, customRange, effectiveScope, locationIds]);

  const dateLabel = useMemo(() => {
    if (datePreset === 'custom' && customRange) {
      return `${format(customRange.from, 'MMM dd, yyyy')} – ${format(customRange.to, 'MMM dd, yyyy')}`;
    }
    return datePreset !== 'custom'
      ? (QUICK_PRESETS.find((p) => p.key === datePreset)?.label ?? 'Select range')
      : 'Select range';
  }, [datePreset, customRange]);

  const handlePresetClick = (preset: QuickPresetKey) => {
    updateFilters({ datePreset: preset, customDateRange: undefined } as any);
    setPendingRange(undefined);
    setShowCalendar(false);
    setDatePickerOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;

    if (range.from && !range.to) {
      setPendingRange({ from: range.from, to: addDays(range.from, 1) });
      return;
    }

    if (range.from && range.to) {
      updateFilters({
        datePreset: 'custom',
        customDateRange: { from: startOfDay(range.from), to: endOfDay(range.to) },
      } as any);
      setPendingRange(undefined);
      setDatePickerOpen(false);
      setShowCalendar(false);
    }
  };

  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getKpiSummary.useQuery();
  const {
    data: eventStats,
    isLoading: eventStatsLoading,
  } = trpc.dashboard.getEventStats.useQuery();
  const { data: capaStats, isLoading: capaStatsLoading } = trpc.dashboard.getCapaStats.useQuery();
  const { data: docStats, isLoading: docStatsLoading } = trpc.dashboard.getDocumentStats.useQuery();

  if (!hasDashboardView) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-center text-muted-foreground">You do not have permission to view the Safety Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <Header />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">Safety Dashboard</h1>

            <div className="flex flex-wrap items-center gap-3">
              <Popover
                open={datePickerOpen}
                onOpenChange={(open) => {
                  setDatePickerOpen(open);
                  if (!open) {
                    setShowCalendar(false);
                    setPendingRange(undefined);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <CalendarIcon className="size-4" />
                    <span>{dateLabel}</span>
                    <ChevronDown className="size-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  {!showCalendar ? (
                    <div className="flex flex-col p-1">
                      {QUICK_PRESETS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePresetClick(key)}
                          className={cn(
                            'rounded-md px-3 py-2 text-left text-sm hover:bg-secondary/80',
                            datePreset === key && 'bg-secondary/50 font-medium',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowCalendar(true)}
                        className={cn(
                          'rounded-md px-3 py-2 text-left text-sm hover:bg-secondary/80',
                          datePreset === 'custom' && 'bg-secondary/50 font-medium',
                        )}
                      >
                        Custom
                      </button>
                    </div>
                  ) : (
                    <Calendar
                      mode="range"
                      min={2}
                      numberOfMonths={2}
                      selected={pendingRange ?? (customRange ? { from: customRange.from, to: customRange.to } : undefined)}
                      onSelect={handleCalendarSelect}
                    />
                  )}
                </PopoverContent>
              </Popover>

              <AsyncLocationsFilter
                selected={locationIds}
                onSelect={(ids) => updateFilter('locationIds', ids as any)}
                label="Location"
                placeholder="Search locations..."
              />

              {hasFullAccess && (
                <div className="flex rounded-md border p-0.5">
                  <Button
                    variant={scope === 'org' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('scope', 'org' as any)}
                  >
                    Organization
                  </Button>
                  <Button
                    variant={scope === 'my' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('scope', 'my' as any)}
                  >
                    Personal
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <KpiCards
              data={kpiData as any}
              isLoading={kpiLoading}
              dateRange={filters.dateRange}
              locationIds={locationIds}
              daysSinceIncident={eventStats?.daysSinceLastIncidentByLocation}
              daysSinceLoading={eventStatsLoading}
              onPendingReviewClick={() => setHighlightDocuments(true)}
            />

            <div className="grid grid-cols-1 gap-6">
              <EventTrendChart data={eventStats?.trend} isLoading={eventStatsLoading} dateRange={filters.dateRange} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <IncidentsByTypeChart data={eventStats?.byType} isLoading={eventStatsLoading} />
              <IncidentsBySeverityChart data={eventStats?.bySeverity} isLoading={eventStatsLoading} />
              <EventsByLocationChart
                data={eventStats?.byLocation}
                isLoading={eventStatsLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CapaStatusChart
                data={capaStats ?? undefined}
                isLoading={capaStatsLoading}
                avgDaysToClose={capaStats?.avgDaysToClose}
              />
              <CapaPriorityChart data={capaStats?.byPriority} isLoading={capaStatsLoading} />
            </div>

            <DocumentStatusTable data={docStats} isLoading={docStatsLoading} highlighted={highlightDocuments} />
          </div>
        </main>
      </div>
    </div>
  );
}
