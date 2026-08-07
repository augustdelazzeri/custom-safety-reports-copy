import { ROUTES } from '@shared/ROUTE_PATHS';
import type { KpiKey } from '@shared/types/dashboard.types';
import { endOfDay } from 'date-fns';

export const DASHBOARD_SAFETY_DOCUMENTS_ID = 'dashboard-safety-documents';

export const formatDateRangeParam = (range: { from?: Date; to?: Date }): string => {
  const parts: string[] = [];
  if (range.from) {
    parts.push(`from:${encodeURIComponent(range.from.toISOString())}`);
  }
  if (range.to) {
    parts.push(`to:${encodeURIComponent(range.to.toISOString())}`);
  }
  return parts.join('|');
};

export const filterVisibleKpiKeys = (isUsCompany: boolean): KpiKey[] => {
  const keys: KpiKey[] = ['openIncidents', 'overdueCapas', 'totalPendingReview'];
  if (isUsCompany) {
    keys.splice(2, 0, 'oshaReportable');
  }
  return keys;
};

export const buildKpiRoute = (
  key: KpiKey,
  dateRange: { from: Date; to: Date } | undefined,
  locationIds: string[],
): string | null => {
  if (key === 'totalPendingReview') {
    return null;
  }

  const params: string[] = [];
  const add = (name: string, value: string) => params.push(`${name}=${value}`);

  if (locationIds.length > 0) {
    add('locationIds', locationIds.join(','));
  }

  switch (key) {
    case 'openIncidents':
      add('status', 'open');
      if (dateRange) {
        add('reportedAtRange', formatDateRangeParam(dateRange));
      }
      return `${ROUTES.EVENT_LIST}?${params.join('&')}`;
    case 'overdueCapas':
      add('status', 'open,in_review');
      add('dueDateRange', formatDateRangeParam({ to: endOfDay(new Date()) }));
      return `${ROUTES.CAPA_LIST}?${params.join('&')}`;
    case 'oshaReportable':
      add('oshaReportable', 'true');
      if (dateRange) {
        add('reportedAtRange', formatDateRangeParam(dateRange));
      }
      return `${ROUTES.EVENT_LIST}?${params.join('&')}`;
    default:
      return null;
  }
};

export const KPI_GRID_COL_CLASSES: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
};

export const getKpiGridColClass = (visibleCardCount: number): string =>
  KPI_GRID_COL_CLASSES[visibleCardCount] ?? 'md:grid-cols-4';
