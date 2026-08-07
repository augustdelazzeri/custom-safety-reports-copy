/**
 * Why this module exists:
 * Auto-size requires coordinated effects (RAF scheduling and resize observer feedback control).
 *
 * What it does:
 * Orchestrates when and how width calculations are applied without creating resize loops.
 */
import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import type { ColumnDef, ColumnOrderState, ColumnPinningState, ColumnSizingState, Table } from '@tanstack/react-table';

import { AUTO_SIZE_RESIZE_OBSERVER_COOLDOWN_MS, type DataTableAutoSizeStrategy } from './config';
import {
  buildNextColumnSizing,
  calculateBaseColumnWidths,
  hasColumnSizingChanges,
  resolveAutoSizeOptions,
  scaleColumnWidthsToFitContainer,
} from './auto-size-engine';

type UseAutoSizeColumnsOptions<TData> = {
  table: Table<TData>;
  tableRootRef: RefObject<HTMLDivElement | null>;
  autoSizeStrategy?: DataTableAutoSizeStrategy;
  columnSizing: ColumnSizingState;
  onColumnSizingChange?: (columnSizing: ColumnSizingState) => void;
  manuallySizedColumnsRef: RefObject<Set<string>>;
  isApplyingAutoSizeRef: RefObject<boolean>;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  columns: ColumnDef<TData>[];
  data: TData[];
};

export const useAutoSizeColumns = <TData>({
  table,
  tableRootRef,
  autoSizeStrategy,
  columnSizing,
  onColumnSizingChange,
  manuallySizedColumnsRef,
  isApplyingAutoSizeRef,
  columnOrder,
  columnPinning,
  columns,
  data,
}: UseAutoSizeColumnsOptions<TData>) => {
  const autoSizeFrameRef = useRef<number | null>(null);
  const applyAutoSizingRef = useRef<() => void>(() => undefined);
  const autoSizeAppliedAtRef = useRef(0);

  const applyAutoSizing = useCallback(() => {
    if (!autoSizeStrategy || autoSizeStrategy.type !== 'fitCellContents' || !onColumnSizingChange) return;
    if (table.getState().columnSizingInfo.isResizingColumn) return;

    const rootElement = tableRootRef.current;
    if (!rootElement) return;

    const tableContainer = rootElement.querySelector<HTMLElement>('[data-slot="table-container"]');
    if (!tableContainer) return;

    const visibleColumns = table.getVisibleLeafColumns();
    if (visibleColumns.length === 0) return;

    const options = resolveAutoSizeOptions(autoSizeStrategy);
    const baseWidths = calculateBaseColumnWidths({
      table,
      visibleColumns,
      rootElement,
      columnSizing,
      options,
      manuallySizedColumns: manuallySizedColumnsRef.current,
    });
    const nextWidths = options.scaleUpToFitGridWidth
      ? scaleColumnWidthsToFitContainer({
          table,
          visibleColumns,
          baseWidths,
          containerWidth: Math.floor(tableContainer.clientWidth),
          options,
          manuallySizedColumns: manuallySizedColumnsRef.current,
        })
      : baseWidths;
    const nextSizing = buildNextColumnSizing(columnSizing, nextWidths);

    if (!hasColumnSizingChanges(visibleColumns, columnSizing, nextSizing)) return;

    isApplyingAutoSizeRef.current = true;
    try {
      autoSizeAppliedAtRef.current = performance.now();
      onColumnSizingChange(nextSizing);
    } finally {
      isApplyingAutoSizeRef.current = false;
    }
  }, [
    autoSizeStrategy,
    columnSizing,
    isApplyingAutoSizeRef,
    manuallySizedColumnsRef,
    onColumnSizingChange,
    table,
    tableRootRef,
  ]);

  useEffect(() => {
    applyAutoSizingRef.current = applyAutoSizing;
  }, [applyAutoSizing]);

  const scheduleAutoSizing = useCallback(() => {
    if (!autoSizeStrategy || autoSizeStrategy.type !== 'fitCellContents' || !onColumnSizingChange) return;

    if (autoSizeFrameRef.current !== null) {
      cancelAnimationFrame(autoSizeFrameRef.current);
    }

    autoSizeFrameRef.current = window.requestAnimationFrame(() => {
      autoSizeFrameRef.current = null;
      applyAutoSizingRef.current();
    });
  }, [autoSizeStrategy, onColumnSizingChange]);

  useEffect(() => {
    if (!autoSizeStrategy || autoSizeStrategy.type !== 'fitCellContents') return;
    scheduleAutoSizing();
  }, [autoSizeStrategy, columnOrder, columnPinning, columns, data, scheduleAutoSizing]);

  useEffect(() => {
    if (!autoSizeStrategy || autoSizeStrategy.type !== 'fitCellContents') return;

    const rootElement = tableRootRef.current;
    if (!rootElement) return;

    const tableContainer = rootElement.querySelector<HTMLElement>('[data-slot="table-container"]');
    if (!tableContainer || typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(() => {
      const elapsedSinceAutoSizeMs = performance.now() - autoSizeAppliedAtRef.current;
      if (elapsedSinceAutoSizeMs < AUTO_SIZE_RESIZE_OBSERVER_COOLDOWN_MS) return;
      scheduleAutoSizing();
    });
    resizeObserver.observe(tableContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [autoSizeStrategy, scheduleAutoSizing, tableRootRef]);

  useEffect(
    () => () => {
      if (autoSizeFrameRef.current !== null) {
        cancelAnimationFrame(autoSizeFrameRef.current);
      }
    },
    [],
  );
};
