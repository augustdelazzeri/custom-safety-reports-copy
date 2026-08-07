export const useAccessPointsUrlFilters = () => ({
  filters: {},
  sort: { sortBy: 'name', sortOrder: 'asc' },
  immediateFilters: { search: '' },
  updateFilter: (key: string, value: any) => {},
  updateFilters: (values: any) => {},
  resetFilters: () => {},
  activeFilterCount: 0,
});

export const useDashboardUrlFilters = () => ({
  immediateFilters: { datePreset: 'week', locationIds: [], scope: 'org' },
  updateFilter: (key: string, value: any) => {},
  updateFilters: (values: any) => {},
});

export const useCapasUrlFilters = () => ({
  filters: { search: '' },
  sort: { sortBy: 'createdAt', sortOrder: 'desc' },
  immediateFilters: { search: '' },
  updateFilter: (key: string, value: any) => {},
  updateFilters: (values: any) => {},
  resetFilters: () => {},
  hasActiveFilters: false,
  activeFilterCount: 0,
});
