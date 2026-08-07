"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, FileDown, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { AuditTable, Filters, AuditLoading, AuditError, AuditEmpty, AuditMobileView } from '@/components/audit/mocks';
import { trpc } from '@/providers/trpc';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AuditLog() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  
  // In a real app we'd use useAuditUrlFilters and useInfiniteAudits
  const { data: audits, isLoading, error } = trpc.audit.list.useQuery();

  const handleResetFilters = () => {
    setSearch('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
        <Header title="Audits & Inspections" />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">
            <span>Documentation</span>
            <ChevronRight className="size-3" />
            <span className="text-gray-900">Audits & Inspections</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">Audits & Inspections</h1>
              <p className="text-xs font-medium text-gray-500">
                View and manage your organization&apos;s safety audits and inspections
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search Audits..."
                  className="pl-9 h-10 rounded-xl border-gray-200 bg-gray-50/50 text-sm focus:bg-white transition-all shadow-2xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm gap-2 whitespace-nowrap">
                <Plus className="size-3.5" />
                Create Audit
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50">
                <FileDown className="size-4" />
              </Button>
            </div>
          </div>

          <Filters />

          {error ? <AuditError /> : null}
          {isLoading ? <AuditLoading /> : null}
          {audits && audits.length === 0 && !isLoading && !error && (
            <AuditEmpty onResetFilters={handleResetFilters} />
          )}

          {!isMobile && audits && audits.length > 0 ? (
            <AuditTable audits={audits} />
          ) : null}

          {isMobile && audits && audits.length > 0 ? (
            <AuditMobileView audits={audits} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
