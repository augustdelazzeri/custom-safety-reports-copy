/**
 * Why this module exists:
 * Keep the DataTable public API in one place while delegating complex behavior to focused modules.
 *
 * What it does:
 * Composes TanStack state handling, drag reordering, pinned rendering, and auto-size orchestration.
 */
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type OnChangeFn,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useCallback, useRef } from 'react';

import {
  DEFAULT_COLUMN_SIZE,
  DEFAULT_MAX_COLUMN_SIZE,
  DEFAULT_MIN_COLUMN_SIZE,
  type DataTableAutoSizeStrategy,
} from './config';
import { getPinnedStyles } from './pinned-styles';
import { SortableHeaderCell } from './sortable-header-cell';
import { useAutoSizeColumns } from './use-auto-size-columns';
import { resolveState } from './utils';

export {
  DEFAULT_DATA_TABLE_AUTO_SIZE_STRATEGY,
  INCLUDE_PINNED_DATA_TABLE_AUTO_SIZE_STRATEGY,
  type DataTableAutoSizeStrategy,
} from './config';

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  columnOrder?: ColumnOrderState;
  onColumnOrderChange?: (columnOrder: ColumnOrderState) => void;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: (columnPinning: ColumnPinningState) => void;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: (columnSizing: ColumnSizingState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void;
  getRowClassName?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  autoSizeStrategy?: DataTableAutoSizeStrategy;
};

export const DataTable = <TData,>({
  columns,
  data,
  sorting,
  onSortingChange,
  columnOrder = [],
  onColumnOrderChange,
  columnPinning = {},
  onColumnPinningChange,
  columnSizing = {},
  onColumnSizingChange,
  columnVisibility = {},
  onColumnVisibilityChange,
  getRowClassName,
  onRowClick,
  autoSizeStrategy,
}: DataTableProps<TData>) => {
  const tableRootRef = useRef<HTMLDivElement | null>(null);
  const isApplyingAutoSizeRef = useRef(false);
  const manuallySizedColumnsRef = useRef(new Set<string>());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    onSortingChange(resolveState(updaterOrValue, sorting));
  };

  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = (updaterOrValue) => {
    onColumnOrderChange?.(resolveState(updaterOrValue, columnOrder));
  };

  const handleColumnPinningChange: OnChangeFn<ColumnPinningState> = (updaterOrValue) => {
    onColumnPinningChange?.(resolveState(updaterOrValue, columnPinning));
  };

  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = (updaterOrValue) => {
    const nextColumnSizing = resolveState(updaterOrValue, columnSizing);

    if (!isApplyingAutoSizeRef.current) {
      const changedColumnIds = new Set<string>([...Object.keys(columnSizing), ...Object.keys(nextColumnSizing)]);
      for (const columnId of changedColumnIds) {
        if (columnSizing[columnId] !== nextColumnSizing[columnId]) {
          manuallySizedColumnsRef.current.add(columnId);
        }
      }
    }

    onColumnSizingChange?.(nextColumnSizing);
  };

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (updaterOrValue) => {
    onColumnVisibilityChange?.(resolveState(updaterOrValue, columnVisibility));
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
      columnPinning,
      columnSizing,
      columnVisibility,
    },
    defaultColumn: {
      size: DEFAULT_COLUMN_SIZE,
      minSize: DEFAULT_MIN_COLUMN_SIZE,
      maxSize: DEFAULT_MAX_COLUMN_SIZE,
    },
    onSortingChange: handleSortingChange,
    onColumnOrderChange: handleColumnOrderChange,
    onColumnPinningChange: handleColumnPinningChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    manualSorting: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableHiding: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
  });

  useAutoSizeColumns({
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
  });

  const totalVisibleWidth = table.getVisibleLeafColumns().reduce((sum, column) => sum + column.getSize(), 0);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeColumn = table.getColumn(activeId);
      const overColumn = table.getColumn(overId);
      if (!activeColumn || !overColumn) return;
      if ((activeColumn.columnDef.meta as any)?.disableColumnOrdering || (overColumn.columnDef.meta as any)?.disableColumnOrdering) {
        return;
      }

      const orderedColumnIds = table.getAllLeafColumns().map((column) => column.id);
      const oldIndex = orderedColumnIds.indexOf(activeId);
      const newIndex = orderedColumnIds.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return;

      onColumnOrderChange?.(arrayMove(orderedColumnIds, oldIndex, newIndex));
    },
    [onColumnOrderChange, table],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div ref={tableRootRef} className="relative z-0">
        <Table className="w-max min-w-full" style={{ width: Math.max(totalVisibleWidth, 1) }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              const headerIds = headerGroup.headers
                .filter((header) => !header.isPlaceholder)
                .map((header) => header.column.id);

              return (
                <SortableContext key={headerGroup.id} items={headerIds} strategy={horizontalListSortingStrategy}>
                  <TableRow>
                    {headerGroup.headers.map((header) => (
                      <SortableHeaderCell key={header.id} header={header} />
                    ))}
                  </TableRow>
                </SortableContext>
              );
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50', getRowClassName?.(row.original))}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    data-column-id={cell.column.id}
                    style={{ width: cell.column.getSize(), ...getPinnedStyles(cell.column, 'cell') }}
                    className={cn(
                      cell.column.getIsPinned() && 'bg-background',
                       (cell.column.columnDef.meta as any)?.cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
};
