/**
 * Why this module exists:
 * Auto-sizing is the highest-complexity part of DataTable and needs isolation for safe iteration and testing.
 *
 * What it does:
 * Contains pure-ish width calculation and scaling utilities used by the auto-size hook.
 */
import type { Column, ColumnSizingState, Table } from '@tanstack/react-table';

import {
  DEFAULT_COLUMN_SIZE,
  DEFAULT_MAX_COLUMN_SIZE,
  DEFAULT_MIN_COLUMN_SIZE,
  type DataTableAutoSizeStrategy,
} from './config';
import { clampWidth, escapeAttributeValue } from './utils';

type ResolvedAutoSizeOptions = {
  includeHeaders: boolean;
  scaleUpToFitGridWidth: boolean;
  sampleRowCount: number;
  contentPadding: number;
  preserveManualSizing: boolean;
  excludePinnedFromScaleToFit: boolean;
};

type CalculateBaseColumnWidthsOptions<TData> = {
  table: Table<TData>;
  visibleColumns: Column<TData, unknown>[];
  rootElement: HTMLElement;
  columnSizing: ColumnSizingState;
  options: ResolvedAutoSizeOptions;
  manuallySizedColumns: Set<string>;
};

type ScaleColumnWidthsToFitContainerOptions<TData> = {
  table: Table<TData>;
  visibleColumns: Column<TData, unknown>[];
  baseWidths: Map<string, number>;
  containerWidth: number;
  options: ResolvedAutoSizeOptions;
  manuallySizedColumns: Set<string>;
};

export const resolveAutoSizeOptions = (autoSizeStrategy: DataTableAutoSizeStrategy): ResolvedAutoSizeOptions => ({
  includeHeaders: autoSizeStrategy.includeHeaders ?? true,
  scaleUpToFitGridWidth: autoSizeStrategy.scaleUpToFitGridWidth ?? true,
  sampleRowCount: Math.max(1, autoSizeStrategy.sampleRowCount ?? 30),
  contentPadding: autoSizeStrategy.contentPadding ?? 8,
  preserveManualSizing: autoSizeStrategy.preserveManualSizing ?? true,
  excludePinnedFromScaleToFit: autoSizeStrategy.excludePinnedFromScaleToFit ?? true,
});

const getColumnMinWidth = <TData>(column: Column<TData, unknown>, table: Table<TData>) =>
  column.columnDef.minSize ?? table.options.defaultColumn?.minSize ?? DEFAULT_MIN_COLUMN_SIZE;

const getColumnMaxWidth = <TData>(column: Column<TData, unknown>, table: Table<TData>) =>
  column.columnDef.maxSize ?? table.options.defaultColumn?.maxSize ?? DEFAULT_MAX_COLUMN_SIZE;

const getColumnCurrentWidth = <TData>(column: Column<TData, unknown>, columnSizing: ColumnSizingState) =>
  columnSizing[column.id] ?? column.getSize() ?? column.columnDef.size ?? DEFAULT_COLUMN_SIZE;

export const calculateBaseColumnWidths = <TData>({
  table,
  visibleColumns,
  rootElement,
  columnSizing,
  options,
  manuallySizedColumns,
}: CalculateBaseColumnWidthsOptions<TData>) => {
  const baseWidths = new Map<string, number>();

  for (const column of visibleColumns) {
    const minWidth = getColumnMinWidth(column, table);
    const maxWidth = getColumnMaxWidth(column, table);
    const currentWidth = getColumnCurrentWidth(column, columnSizing);
    const preserveCurrentWidth = options.preserveManualSizing && manuallySizedColumns.has(column.id);
    const shouldMeasure = (column.columnDef.meta as any)?.autoSize !== false && !preserveCurrentWidth;

    if (!shouldMeasure) {
      baseWidths.set(column.id, clampWidth(currentWidth, minWidth, maxWidth));
      continue;
    }

    const escapedColumnId = escapeAttributeValue(column.id);
    let measuredWidth = 0;
    let maxMeasuredClientWidth = 0;

    if (options.includeHeaders) {
      const headerElement = rootElement.querySelector<HTMLElement>(`th[data-column-id="${escapedColumnId}"]`);
      measuredWidth = Math.max(measuredWidth, headerElement?.scrollWidth ?? 0);
      maxMeasuredClientWidth = Math.max(maxMeasuredClientWidth, headerElement?.clientWidth ?? 0);
    }

    const cellElements = rootElement.querySelectorAll<HTMLElement>(`td[data-column-id="${escapedColumnId}"]`);
    const sampleCount = Math.min(options.sampleRowCount, cellElements.length);
    for (let index = 0; index < sampleCount; index += 1) {
      const cellElement = cellElements[index];
      measuredWidth = Math.max(measuredWidth, cellElement?.scrollWidth ?? 0);
      maxMeasuredClientWidth = Math.max(maxMeasuredClientWidth, cellElement?.clientWidth ?? 0);
    }

    if (measuredWidth === 0) {
      measuredWidth = currentWidth;
      maxMeasuredClientWidth = Math.max(maxMeasuredClientWidth, currentWidth);
    }

    const contentOverflows = maxMeasuredClientWidth > 0 && measuredWidth > maxMeasuredClientWidth;
    const targetWidth = contentOverflows ? measuredWidth + options.contentPadding : measuredWidth;
    baseWidths.set(column.id, clampWidth(Math.ceil(targetWidth), minWidth, maxWidth));
  }

  return baseWidths;
};

export const scaleColumnWidthsToFitContainer = <TData>({
  table,
  visibleColumns,
  baseWidths,
  containerWidth,
  options,
  manuallySizedColumns,
}: ScaleColumnWidthsToFitContainerOptions<TData>) => {
  const scaledWidths = new Map(baseWidths);
  const totalWidth = visibleColumns.reduce((sum, column) => sum + (scaledWidths.get(column.id) ?? 0), 0);
  if (containerWidth <= totalWidth) return scaledWidths;

  const scalableColumns = visibleColumns.filter((column) => {
    if ((column.columnDef.meta as any)?.scaleToFit === false) return false;
    if (options.preserveManualSizing && manuallySizedColumns.has(column.id)) return false;
    if (options.excludePinnedFromScaleToFit && !!column.getIsPinned()) return false;
    return true;
  });

  if (scalableColumns.length === 0) return scaledWidths;

  const scalableIds = new Set(scalableColumns.map((column) => column.id));
  const fixedWidth = visibleColumns.reduce((sum, column) => {
    if (scalableIds.has(column.id)) return sum;
    return sum + (scaledWidths.get(column.id) ?? 0);
  }, 0);

  const targetScalableWidth = Math.max(0, containerWidth - fixedWidth);
  const baseScalableWidth = scalableColumns.reduce((sum, column) => sum + (scaledWidths.get(column.id) ?? 0), 0);
  if (targetScalableWidth <= baseScalableWidth || baseScalableWidth <= 0) return scaledWidths;

  let consumedWidth = 0;
  scalableColumns.forEach((column, index) => {
    const minWidth = getColumnMinWidth(column, table);
    const maxWidth = getColumnMaxWidth(column, table);
    const baseWidth = scaledWidths.get(column.id) ?? DEFAULT_COLUMN_SIZE;
    const proportionalWidth =
      index === scalableColumns.length - 1
        ? targetScalableWidth - consumedWidth
        : Math.round((baseWidth / baseScalableWidth) * targetScalableWidth);
    const clamped = clampWidth(proportionalWidth, minWidth, maxWidth);

    scaledWidths.set(column.id, clamped);
    consumedWidth += clamped;
  });

  let remainder = targetScalableWidth - consumedWidth;
  while (remainder > 0) {
    let didGrowColumn = false;

    for (const column of scalableColumns) {
      if (remainder <= 0) break;

      const maxWidth = getColumnMaxWidth(column, table);
      const currentWidth = scaledWidths.get(column.id) ?? 0;
      if (currentWidth >= maxWidth) continue;

      scaledWidths.set(column.id, currentWidth + 1);
      remainder -= 1;
      didGrowColumn = true;
    }

    if (!didGrowColumn) break;
  }

  return scaledWidths;
};

export const buildNextColumnSizing = (columnSizing: ColumnSizingState, widthsByColumnId: Map<string, number>) => {
  const nextSizing: ColumnSizingState = { ...columnSizing };
  for (const [columnId, width] of widthsByColumnId.entries()) {
    nextSizing[columnId] = width;
  }
  return nextSizing;
};

export const hasColumnSizingChanges = <TData>(
  visibleColumns: Column<TData, unknown>[],
  columnSizing: ColumnSizingState,
  nextSizing: ColumnSizingState,
) =>
  visibleColumns.some((column) => {
    const currentWidth = columnSizing[column.id] ?? column.getSize();
    const nextWidth = nextSizing[column.id];
    if (typeof nextWidth !== 'number') return false;
    return Math.abs(currentWidth - nextWidth) >= 1;
  });
