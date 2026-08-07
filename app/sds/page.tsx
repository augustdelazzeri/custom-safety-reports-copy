"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Search, X, FileUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  SdsTable, 
  Filters, 
  SdsLoading, 
  SdsError, 
  SdsEmpty, 
  SdsMobileView
} from '@/components/sds/mocks';
import { trpc } from '@/providers/trpc';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SdsLog() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error } = trpc.sds.list.infiniteOptions.useInfiniteQuery();
  const sdsList = data?.pages?.[0]?.result || [];

  const handleResetFilters = () => {
    setSearch('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Safety Data Sheets (SDS)" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            <div>
              <h1 className="text-2xl font-bold">SDS Library</h1>
              <p className="mt-1 text-sm text-muted-foreground">Comprehensive library of chemical safety documentation.</p>
            </div>
            <div className="flex w-full items-center gap-2 md:w-auto">
                <Button className="flex-1 bg-blue-700 hover:bg-blue-800">
                  <FileUp className="h-4 w-4 mr-2" /> Upload SDS
                </Button>
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
                  placeholder="Search chemicals..."
                  className="pr-4 pl-8 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>

          {error ? <SdsError /> : null}
          {isLoading ? <SdsLoading /> : null}
          {sdsList?.length === 0 && !isLoading && !error && (
            <SdsEmpty />
          )}

          {!isMobile && sdsList && sdsList.length > 0 ? (
            <SdsTable sdsList={sdsList} />
          ) : null}

          {isMobile && sdsList && sdsList.length > 0 ? (
            <SdsMobileView sdsList={sdsList} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
