"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  WorkOrderTable, 
  WorkOrderFilters, 
  WorkOrderLoading, 
  WorkOrderError, 
  WorkOrderEmpty, 
  WorkOrderMobileView,
  WorkOrderMobileFilters
} from '@/components/work-orders/mocks';
import { trpc } from '@/providers/trpc';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SafetyWorkOrderLog() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  
  const { data: workOrders, isLoading, error } = trpc.linkedEntities.getWorkOrderLinkedEntities.useQuery({
    linkedEntityType: ['work_order']
  });

  const handleResetFilters = () => {
    setSearch('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Safety Work Orders" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            <div>
              <h1 className="text-2xl font-bold">Safety Work Orders</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage and track maintenance tasks originating from safety audits.</p>
            </div>
            <div className="flex w-full items-start gap-4 pb-4 md:w-auto md:flex-row md:gap-2 md:pb-0">
               <WorkOrderMobileFilters />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <WorkOrderFilters
              activeFilterCount={search ? 1 : 0}
              resetFilters={handleResetFilters}
            />
            <div className="relative w-full flex-1 md:w-64">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
                  className="pr-4 pl-8 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>

          {error ? <WorkOrderError /> : null}
          {isLoading ? <WorkOrderLoading /> : null}
          {workOrders?.length === 0 && !isLoading && !error && (
            <WorkOrderEmpty />
          )}

          {!isMobile && workOrders && workOrders.length > 0 ? (
            <WorkOrderTable workOrders={workOrders} />
          ) : null}

          {isMobile && workOrders && workOrders.length > 0 ? (
            <WorkOrderMobileView workOrders={workOrders} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
