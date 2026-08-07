"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MoreVertical, 
  Check, 
  X, 
  Edit, 
  Download, 
  User, 
  FileText, 
  Clock, 
  Calendar, 
  ArrowLeft
} from 'lucide-react';
import { 
  GeneralInformationPanel,
  HazardsAndControlsPanel,
  PtwChecklistPanel,
  PtwPersonnelSection,
  PtwLoading,
  PtwError
} from '@/components/ptw/mocks';
import { 
  DetailSidebar,
  ApproversSection,
  LocationAndAssetsSection,
  TimelineSection
} from '@/components/audit/details/mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function PtwDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: ptw, isLoading, error } = trpc.ptw.getByInstanceId.useQuery({ id: params.id });

  if (isLoading || !ptw) return <PtwLoading />;
  if (error) return <PtwError />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="PTW Details" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="sticky top-0 z-10 w-full border-b bg-white/95 p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => router.push('/ptws')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">{ptw.slug}</Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">{ptw.status}</Badge>
                  <Badge variant="outline" className="text-slate-500 font-mono text-[10px]">v{ptw.version}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{ptw.title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/ptws/${params.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Owner:</span>
                {ptw.owner?.fullName}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Last Updated:</span>
                {new Date(ptw.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Review Date:</span>
                {new Date(ptw.reviewDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-6 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <GeneralInformationPanel 
                  type={ptw.type} 
                  startDate={ptw.startDate}
                  endDate={ptw.endDate}
                  scope={ptw.scope}
                  emergencyContact={ptw.emergencyContact}
                />
                <HazardsAndControlsPanel />
                <PtwChecklistPanel />
              </div>

              <DetailSidebar>
                <Card className="p-6">
                  <PtwPersonnelSection owner={ptw.owner} issuer={ptw.issuer} />
                  <div className="my-6 border-t border-gray-100" />
                  <ApproversSection approvers={ptw.approvers} />
                  <div className="my-6 border-t border-gray-100" />
                  <LocationAndAssetsSection location={ptw.location} />
                  <div className="my-6 border-t border-gray-100" />
                  <TimelineSection />
                </Card>
              </DetailSidebar>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
