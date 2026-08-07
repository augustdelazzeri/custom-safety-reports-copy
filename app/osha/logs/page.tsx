"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, FileDown, Plus } from 'lucide-react';
import { 
  OshaReportsTable, 
  Filters, 
  OshaReportsLoading, 
  OshaReportsError, 
  OshaReportsEmpty, 
  OshaReportsMobileView,
  MobileFilters,
  AsyncOshaLocationFilter,
  YearSelect
} from '@/components/osha/mocks';
import { trpc } from '@/providers/trpc';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';

export default function OshaLogs() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error } = trpc.oshaReport.list.infiniteOptions.useInfiniteQuery();
  const reports = data?.pages?.[0]?.result || [];

  const handleResetFilters = () => {
    setSearch('');
  };

  const t = (key: string) => {
    const translations: Record<string, string> = {
      'osha.log.title': 'OSHA Incident Logs',
      'osha.log.description': 'Official record-keeping for workplace injuries and illnesses.',
      'osha.log.searchPlaceholder': 'Search by employee or case...',
      'osha.log.createButton': 'New Case',
    };
    return translations[key] || key;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={t('osha.log.title')} />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold md:mb-0">{t('osha.log.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('osha.log.description')}
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
               <AsyncOshaLocationFilter />
               <YearSelect value="2026" />
               <div className="flex w-full items-center gap-2 lg:w-auto">
                <Button className="flex-1" onClick={() => router.push('/osha/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('osha.log.createButton')}
                </Button>
                <MobileFilters />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <Filters
              activeFilterCount={search ? 1 : 0}
              resetFilters={handleResetFilters}
            />
            <div className="relative w-full flex-1 md:w-64">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('osha.log.searchPlaceholder')}
                  className="pr-4 pl-8 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>

          {error ? <OshaReportsError /> : null}
          {isLoading ? <OshaReportsLoading /> : null}
          {reports.length === 0 && !isLoading && !error && (
            <OshaReportsEmpty onResetFilters={handleResetFilters} />
          )}

          {!isMobile && reports.length > 0 ? (
            <OshaReportsTable oshaReports={reports} />
          ) : null}

          {isMobile && reports.length > 0 ? (
            <OshaReportsMobileView oshaReports={reports} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
