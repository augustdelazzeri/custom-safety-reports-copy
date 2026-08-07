export type DataTableAutoSizeStrategy = {
  type: 'fitCellContents';
  includeHeaders?: boolean;
  scaleUpToFitGridWidth?: boolean;
  sampleRowCount?: number;
  contentPadding?: number;
  preserveManualSizing?: boolean;
  excludePinnedFromScaleToFit?: boolean;
};

export const DEFAULT_COLUMN_SIZE = 150;
export const DEFAULT_MIN_COLUMN_SIZE = 64;
export const DEFAULT_MAX_COLUMN_SIZE = 500;
export const AUTO_SIZE_RESIZE_OBSERVER_COOLDOWN_MS = 100;

export const DEFAULT_DATA_TABLE_AUTO_SIZE_STRATEGY: DataTableAutoSizeStrategy = {
  type: 'fitCellContents',
  includeHeaders: true,
  scaleUpToFitGridWidth: true,
  sampleRowCount: 30,
  contentPadding: 8,
  preserveManualSizing: true,
  excludePinnedFromScaleToFit: true,
};

export const INCLUDE_PINNED_DATA_TABLE_AUTO_SIZE_STRATEGY: DataTableAutoSizeStrategy = {
  ...DEFAULT_DATA_TABLE_AUTO_SIZE_STRATEGY,
  excludePinnedFromScaleToFit: false,
};
