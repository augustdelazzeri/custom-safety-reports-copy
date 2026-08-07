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
  GeneralInformation,
  EnergySourcesPanel,
  ProceduresPanel,
  SafetyProtocolsPanel,
  LotoPersonnelSection,
  LotoLoading,
  LotoError
} from '@/components/loto/mocks';
import { 
  DetailSidebar,
  ApproversSection,
  LocationAndAssetsSection,
  TimelineSection
} from '@/components/audit/details/mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function LotoDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: loto, isLoading, error } = trpc.loto.getByInstanceId.useQuery({ id: params.id });

  if (isLoading || !loto) return <LotoLoading />;
  if (error) return <LotoError />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="LOTO Details" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="sticky top-0 z-10 w-full border-b bg-white/95 p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => router.push('/lotos')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">{loto.slug}</Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">{loto.status}</Badge>
                  <Badge variant="outline" className="text-slate-500 font-mono text-[10px]">v{loto.version}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{loto.title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/lotos/${params.id}/edit`)}>
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
                {loto.owner?.fullName}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Last Updated:</span>
                {new Date(loto.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Review Date:</span>
                {new Date(loto.reviewDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-6 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <GeneralInformation department={loto.department} procedures={loto.procedureGroups.general} />
                <EnergySourcesPanel energySources={loto.energySources} />
                <ProceduresPanel 
                  procedures={loto.procedureGroups.procedure}
                  preProcedures={loto.procedureGroups.pre_procedure}
                  postProcedures={loto.procedureGroups.post_procedure}
                />
                <SafetyProtocolsPanel />
              </div>

              <DetailSidebar>
                <Card className="p-6">
                  <LotoPersonnelSection owner={loto.owner} issuer={loto.issuer} />
                  <div className="my-6 border-t border-gray-100" />
                  <ApproversSection approvers={loto.approvers} />
                  <div className="my-6 border-t border-gray-100" />
                  <LocationAndAssetsSection location={loto.location} assets={loto.asset ? [loto.asset] : []} />
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
