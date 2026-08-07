export type KpiKey = 'openIncidents' | 'overdueCapas' | 'oshaReportable' | 'totalPendingReview';

export type DashboardDatePreset = 'today' | 'week' | 'month' | 'quarter' | 'all' | 'custom';

export type BreakdownItem = {
  label: string;
  count: number;
};

export type EventStatsOutput = {
  daysSinceLastIncidentByLocation: { locationId: string; locationName: string; daysSince: number | null }[];
  trend: { date: string; count: number }[];
  byType: BreakdownItem[];
  bySeverity: BreakdownItem[];
  byLocation: { locationName: string; count: number }[];
};

export type KpiSummaryOutput = Record<KpiKey, number>;

export type CapaStatsOutput = {
  total: number;
  open: number;
  overdue: number;
  avgDaysToClose: number;
  byPriority: BreakdownItem[];
};

export type DocumentStatsOutput = {
  total: number;
  pendingReview: number;
  byStatus: BreakdownItem[];
};
