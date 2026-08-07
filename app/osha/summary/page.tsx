"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Archive, Download, FileBarChart } from 'lucide-react';
import { 
  CasesSummary,
  EstablishmentInformationDetails,
  CompanyExecutiveCertificationDetails,
  OshaSummaryLoading,
  OshaLocationEmpty,
  AsyncOshaLocationFilter,
  YearSelect
} from '@/components/osha/mocks';
import { trpc } from '@/providers/trpc';

export default function OshaSummary() {
  const [oshaLocationId, setOshaLocationId] = useState('loc1');
  const [year, setYear] = useState('2026');

  const { data: establishmentInfo, isLoading: isEstLoading } = trpc.oshaSummary.getEstablishmentInformation.useQuery({
    year,
    oshaLocationId
  });

  const { data: summary, isLoading: isSumLoading } = trpc.oshaSummary.getOshaCasesSummary.useQuery({
    year,
    oshaLocationId
  });

  const isLoading = isEstLoading || isSumLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="OSHA 300A Summary" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
              <div>
                <h1 className="text-2xl font-bold">OSHA 300A Summary</h1>
                <p className="mt-1 text-sm text-muted-foreground">Annual summary of work-related injuries and illnesses.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AsyncOshaLocationFilter />
                <YearSelect value={year} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 border-b py-6 md:sticky md:top-0 md:z-10 lg:flex-row lg:items-center lg:justify-end mt-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" /> Archive Year
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button size="sm">
                  <FileBarChart className="h-4 w-4 mr-2" /> Submit OSHA Report
                </Button>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {!oshaLocationId ? (
                <OshaLocationEmpty />
              ) : isLoading ? (
                <OshaSummaryLoading />
              ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="space-y-6">
                    <EstablishmentInformationDetails establishmentInfo={establishmentInfo} />
                    <CompanyExecutiveCertificationDetails />
                  </div>
                  <div>
                    <CasesSummary summary={summary} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
