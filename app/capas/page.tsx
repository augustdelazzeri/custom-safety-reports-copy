"use client";

import { Filters, CapaTable, CapasEmpty, CapasError, CapasLoading, CapaMobileFilters, CapaMobileView } from '@/components/capas/list/mocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDataTableStateAdapter } from '@/hooks/use-data-table-state-adapter';
import { useInfiniteCapas } from '@/hooks/use-paginated-data';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSION_KEYS } from '@shared/types/permissions.types';
import { useCapasUrlFilters } from '@/hooks/use-url-filters';
import { trpc } from '@/providers/trpc';
import {
  CAPA_DEFAULT_SORT_BY,
  CAPA_DEFAULT_SORT_ORDER,
  isCapaSortBy,
  isCapaTableColumnId,
  type CapaSortBy,
  type CapaTableColumnId,
} from '@shared/types/capas.types';
import { FileDown, Search, X } from 'lucide-react';
import { useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function CapaLog() {
  const { hasPermission } = usePermissions();

  const {
    filters,
    sort,
    immediateFilters,
    updateFilter,
    updateFilters,
    resetFilters,
  } = useCapasUrlFilters();

  const {
    sorting,
    onSortingChange: handleSortingChange,
    resetSorting: handleClearSorting,
    columnOrder,
    onColumnOrderChange: handleColumnOrderChange,
    columnPinning,
    onColumnPinningChange: handleColumnPinningChange,
    columnSizing,
    onColumnSizingChange: handleColumnSizingChange,
    columnVisibility,
    onColumnVisibilityChange: handleColumnVisibilityChange,
  } = useDataTableStateAdapter<CapaSortBy, CapaTableColumnId>({
    sort,
    defaultSortBy: CAPA_DEFAULT_SORT_BY,
    defaultSortOrder: CAPA_DEFAULT_SORT_ORDER,
    isSortBy: isCapaSortBy,
    isColumnId: isCapaTableColumnId,
    setSort: (nextSort: any) => updateFilters(nextSort),
    setColumnOrder: () => {},
    setColumnPinning: () => {},
    setColumnSizing: () => {},
    setColumnVisibility: () => {},
  });

  const {
    data: capas,
    isLoading,
    error,
  } = useInfiniteCapas({
    filters,
    sort,
  });

  const { mutateAsync: exportCapas, isPending: isExporting } = trpc.capa.export.useMutation();

  const toggleFilter = useCallback(() => {}, []);
  const trackFilterApplied = useCallback(() => {}, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="container mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">CAPA Log</h1>
                <p className="mt-1 text-sm text-muted-foreground">Corrective and Preventive Actions tracking.</p>
              </div>

              <div className="flex w-full flex-col-reverse items-start gap-4 pb-4 md:w-auto md:flex-row md:gap-2 md:pb-0">
                <div className="relative w-full flex-1 md:w-64">
                  <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search CAPAs..."
                    className="pr-4 pl-8"
                    value={immediateFilters.search ?? ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                  />
                  {immediateFilters.search && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => updateFilter('search', '')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex w-full items-start gap-4 md:w-auto md:flex-row md:gap-2">
                  <Button className="flex-1">
                    Create CAPA
                  </Button>
                  <Button variant="outline" size="icon" disabled={isExporting} onClick={() => exportCapas({})}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Filters />

            {error ? <CapasError /> : null}
            {isLoading ? <CapasLoading /> : null}

            {capas && capas.length === 0 && !isLoading && !error && (
              <CapasEmpty />
            )}

            {capas && capas.length > 0 ? (
              <CapaTable
                capas={capas}
                sorting={sorting}
                onSortingChange={handleSortingChange}
                columnOrder={columnOrder}
                onColumnOrderChange={handleColumnOrderChange}
                columnPinning={columnPinning}
                onColumnPinningChange={handleColumnPinningChange}
                columnSizing={columnSizing}
                onColumnSizingChange={handleColumnSizingChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={handleColumnVisibilityChange}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
