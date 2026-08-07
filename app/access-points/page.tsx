"use client";

import {
  AccessPointBulkActionsDropdown,
  AccessPointBulkImport,
  AccessPointsEmpty,
  AccessPointsError,
  Filters,
  AccessPointsLoading,
  MobileFilters,
  AccessPointsMobileView,
  AccessPointsTable,
  BulkImportSummaryModal,
  QrViewingModal,
} from '@/components/access-points/mocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDataTableStateAdapter } from '@/hooks/use-data-table-state-adapter';
import { useInfiniteAccessPoints } from '@/hooks/use-paginated-data';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSION_KEYS } from '@shared/types/permissions.types';
import { useAccessPointsUrlFilters } from '@/hooks/use-url-filters';
import { trpc } from '@/providers/trpc';
import { ROUTES } from '@shared/ROUTE_PATHS';
import {
  ACCESS_POINTS_DEFAULT_SORT_BY,
  ACCESS_POINTS_DEFAULT_SORT_ORDER,
  isAccessPointsTableColumnId,
  isAccessPointsSortBy,
  type AccessPointsSortBy,
  type AccessPointsTableColumnId,
} from '@shared/types/access-points.types';
import { FileDown, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// Mock translation
const t = (key: string, options?: any) => {
  const map: Record<string, string> = {
    'accessPoints.view.title': 'Access Points',
    'accessPoints.view.description': 'Manage physical access points and QR codes',
    'accessPoints.view.searchPlaceholder': 'Search access points...',
    'accessPoints.view.createButton': 'Create Access Point',
    'accessPoints.view.exportTooltipLine1': 'Export current view',
  };
  return map[key] || key;
};

export default function AccessPointsView() {
  const router = useRouter();
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<any>(undefined);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [bulkImportResult, setBulkImportResult] = useState<any>(null);

  const { hasPermission } = usePermissions();
  const isMobile = false; // Mock for now

  const getSortLabel = (sortBy: AccessPointsSortBy): string => sortBy;

  const { filters, sort, immediateFilters, updateFilter, updateFilters, resetFilters, activeFilterCount } =
    useAccessPointsUrlFilters();
    
  const {
    sorting,
    hasActiveSorting,
    columnOrder,
    columnPinning,
    columnSizing,
    onSortingChange: handleSortingChange,
    resetSorting: handleClearSorting,
    onColumnOrderChange: handleColumnOrderChange,
    onColumnPinningChange: handleColumnPinningChange,
    onColumnSizingChange: handleColumnSizingChange,
    columnVisibility,
    onColumnVisibilityChange: handleColumnVisibilityChange,
  } = useDataTableStateAdapter({
    sort,
    immediateFilters,
    defaultSortBy: ACCESS_POINTS_DEFAULT_SORT_BY,
    defaultSortOrder: ACCESS_POINTS_DEFAULT_SORT_ORDER,
  } as any);

  const {
    data: accessPoints,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteAccessPoints({ filters, sort });

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleBulkImportSuccess = (result: any) => {
    setBulkImportResult(result);
    setIsBulkImportOpen(false);
    setIsSummaryModalOpen(true);
  };

  const handleExport = async () => {
    console.log('Exporting...');
  };

  const handleViewQRCode = useCallback((accessPoint: any) => {
    setSelectedAccessPoint(accessPoint);
    setIsQrModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-[var(--spacing-sidebar)]">
        <Header />
        <main className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            <div>
              <h1 className="text-2xl font-bold md:mb-0">{t('accessPoints.view.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t('accessPoints.view.description')}</p>
            </div>

            <div className="flex min-h-10 w-full flex-col-reverse items-start gap-4 pb-4 md:w-auto md:flex-row md:gap-2 md:pb-0">
              <div className="relative w-full flex-1 md:w-64">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('accessPoints.view.searchPlaceholder')}
                  className="pr-4 pl-8"
                  value={immediateFilters.search ?? ''}
                  onChange={(e) => updateFilter('search' as any, e.target.value)}
                />
                {immediateFilters.search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={() => updateFilter('search' as any, '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex w-full items-start gap-4 md:w-auto md:flex-row md:gap-2">
                {hasPermission(PERMISSION_KEYS.ACCESS_CREATE) && (
                  <>
                    <Button
                      onClick={() => router.push('/access-points/new')}
                      className="flex-1"
                    >
                      {t('accessPoints.view.createButton')}
                    </Button>
                    <AccessPointBulkActionsDropdown onImportClick={() => setIsBulkImportOpen(true)} />
                  </>
                )}
                {hasPermission(PERMISSION_KEYS.ACCESS_VIEW) && (
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      {t('accessPoints.view.exportTooltipLine1')}
                    </TooltipContent>
                  </Tooltip>
                )}
                <MobileFilters />
              </div>
            </div>
          </div>

          <Filters />

          {/* Error state */}
          {error && <AccessPointsError />}

          {/* Loading state */}
          {isLoading && <AccessPointsLoading />}

          <QrViewingModal />

          <AccessPointBulkImport />

          <BulkImportSummaryModal />

          {/* Table View */}
          {!isLoading && !error && accessPoints && accessPoints.length > 0 && (
            <AccessPointsTable
              accessPoints={accessPoints}
              onViewQRCode={handleViewQRCode}
            />
          )}

          {/* Empty state */}
          {!isLoading && !error && accessPoints && accessPoints.length === 0 && (
            <AccessPointsEmpty />
          )}

          {/* Load More */}
          {accessPoints && accessPoints.length > 0 && hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="px-6"
              >
                Load More
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
