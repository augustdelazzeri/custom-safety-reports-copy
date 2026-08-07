"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, FileDown, Plus } from 'lucide-react';
import { 
  SopTable, 
  Filters, 
  SopLoading, 
  SopError, 
  SopEmpty, 
  SopMobileView,
  MobileFilters
} from '@/components/sop/mocks';
import { trpc } from '@/providers/trpc';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';

export default function SopLog() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error } = trpc.sop.list.infiniteOptions.useInfiniteQuery();
  const sops = data?.pages?.[0]?.result || [];

  const handleResetFilters = () => {
    setSearch('');
  };

  const t = (key: string) => {
    const translations: Record<string, string> = {
      'sops.log.title': 'Standard Operating Procedures',
      'sops.log.description': 'Manage and distribute standardized safety procedures.',
      'sops.log.searchPlaceholder': 'Search SOPs...',
      'sops.log.createButton': 'Create SOP',
    };
    return translations[key] || key;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={t('sops.log.title')} />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold md:mb-0">{t('sops.log.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('sops.log.description')}
              </p>
            </div>
            <div className="flex w-full flex-col-reverse items-start gap-4 pb-4 md:w-auto md:flex-row md:gap-2 md:pb-0">
              <div className="relative w-full flex-1 md:w-64">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('sops.log.searchPlaceholder')}
                  className="pr-4 pl-8 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={() => setSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex w-full items-center gap-2 md:w-auto">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push('/sops/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('sops.log.createButton')}
                </Button>
                <Button variant="outline" size="icon" className="bg-white">
                  <FileDown className="h-4 w-4" />
                </Button>
                <MobileFilters />
              </div>
            </div>
          </div>

          <Filters
            activeFilterCount={search ? 1 : 0}
            resetFilters={handleResetFilters}
          />

          {error ? <SopError /> : null}
          {isLoading ? <SopLoading /> : null}
          {sops.length === 0 && !isLoading && !error && (
            <SopEmpty onResetFilters={handleResetFilters} />
          )}

          {!isMobile && sops.length > 0 ? (
            <SopTable sops={sops} />
          ) : null}

          {isMobile && sops.length > 0 ? (
            <SopMobileView sops={sops} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
