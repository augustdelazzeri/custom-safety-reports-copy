"use client";

import { 
  CapaHeader, 
  CapaLoading, 
  CapaError, 
  OwnerSection, 
  LinkedTo, 
  RootCauseBadge, 
  EffectivenessBadge,
  CapaLinkedComplianceTasks,
  TagsSection
} from '@/components/capas/details/mocks';
import { StatusSection, LocationAndAssetsSection, TimelineSection, DetailSidebar, CommentsSection } from '@/components/events/details/mocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/providers/trpc';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AlertTriangle } from 'lucide-react';

export default function CapaDetails() {
  const params = useParams();
  const capaId = params.id as string;

  const {
    data: capa,
    isLoading,
    error,
  } = trpc.capa.getById.useQuery({ id: capaId });

  const { data: workOrders } = trpc.workOrder.getByCapa.useQuery({
    capaId: [capaId],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <CapaLoading />
          </main>
        </div>
      </div>
    );
  }

  if (error || !capa) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <CapaError />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <CapaHeader capa={capa} />
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-6 lg:col-span-2">
                {/* AI Insight Placeholder */}
                <Card className="border-blue-200 bg-blue-50 shadow-sm">
                  <CardContent className="py-4">
                    <p className="text-sm text-blue-800">
                      This {capa.type.toLowerCase()} addresses findings from <strong>{capa.eventSlug}</strong>. 
                      Due in {capa.dueDate}.
                    </p>
                  </CardContent>
                </Card>

                {/* Root Cause Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900">Root Cause Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                      {capa.rcaFindings}
                    </div>
                  </CardContent>
                </Card>

                {/* Proposed Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900">Proposed Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                      {capa.actionsToAddress}
                    </div>
                  </CardContent>
                </Card>

                <CommentsSection />
              </div>

              {/* Sidebar */}
              <DetailSidebar>
                <OwnerSection owner={capa.owner} dueDate={capa.dueDate} />
                <StatusSection status={capa.status} />
                <LocationAndAssetsSection location={capa.location?.name} />
                <LinkedTo capa={capa} workOrders={workOrders} />
                <TimelineSection />
              </DetailSidebar>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
