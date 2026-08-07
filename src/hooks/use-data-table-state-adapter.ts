export const useDataTableStateAdapter = <T1 = any, T2 = any>(config: any) => ({
  sorting: [],
  hasActiveSorting: false,
  columnOrder: [],
  columnPinning: { left: [], right: ['actions'] },
  columnSizing: {},
  onSortingChange: () => {},
  resetSorting: () => {},
  onColumnOrderChange: () => {},
  onColumnPinningChange: () => {},
  onColumnSizingChange: () => {},
  columnVisibility: {},
  onColumnVisibilityChange: () => {},
});
