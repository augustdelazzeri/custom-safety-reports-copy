"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MoreVertical, 
  Send, 
  Check, 
  CheckCircle2,
  X, 
  Edit, 
  History, 
  Download, 
  Copy, 
  Archive, 
  Trash2,
  User,
  FileText,
  Clock,
  Calendar,
  ArrowLeft,
  ChevronRight,
  Share2,
  ExternalLink
} from 'lucide-react';
import { 
  GeneralInformationPanel,
  LinkedItemsPanel,
  DetailSidebar,
  AuditPersonnelSection,
  ApproversSection,
  LocationAndAssetsSection,
  TimelineSection,
  AuditDetailsLoading,
  AuditDetailsError
} from '@/components/audit/details/mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function AuditDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: audit, isLoading, error } = trpc.audit.getByInstanceId.useQuery({ id: params.id });

  if (isLoading || !audit) return <AuditDetailsLoading />;
  if (error) return <AuditDetailsError />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
        <Header title="Audit Details" />
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumbs / Header area */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">
              <span>Documentation</span>
              <ChevronRight className="size-3" />
              <span className="text-gray-900">Audit Details</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-[11px] font-bold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100" 
                      onClick={() => router.push('/audits')}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1.5" />
                      Back
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">{audit.title}</h1>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-bold text-gray-400 border-gray-200 bg-gray-50/50 px-1.5 py-0 h-5">v{audit.version}</Badge>
                        <Badge variant="outline" className="text-[10px] font-bold text-gray-500 border-gray-200 bg-gray-50/50 px-1.5 py-0 h-5 tracking-tight uppercase">{audit.slug}</Badge>
                        {audit.status === 'Approved/Active' && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                            <CheckCircle2 className="size-3" />
                            {audit.status}
                          </div>
                        )}
                      </div>
                    </div>
                  <div className="flex flex-wrap items-center gap-x-4 text-[11px] font-semibold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5 text-gray-300" />
                      Owner: <span className="text-gray-600 font-bold">{audit.owner?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5 text-gray-300" />
                      Approvers: <span className="text-gray-600 font-bold">August Delazzeri</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-gray-300" />
                      Last Reviewed: <span className="text-gray-600 font-bold">{audit.lastReviewed}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0">
                <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs">
                  Submit for Review
                </Button>
                <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm gap-2">
                  <Download className="size-3.5" />
                  Export PDF
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:bg-gray-50 rounded-xl">
                  <MoreVertical className="size-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-6 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2 space-y-6">
                <GeneralInformationPanel 
                  type={audit.type} 
                  description={audit.description}
                  locationName={audit.location?.name}
                />
                <LinkedItemsPanel 
                  checklists={audit.checklists}
                  workOrders={audit.workOrders}
                  pms={audit.pms}
                />
              </div>

              <div className="lg:col-span-1 border border-gray-100 rounded-2xl bg-white p-6 shadow-2xs space-y-0 divide-y divide-gray-100">
                <div className="pb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <User className="size-4" />
                    <h4 className="text-[11px] font-bold uppercase tracking-widest">Personnel</h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Owner</span>
                    <p className="text-xs font-bold text-gray-900">{audit.owner?.fullName}</p>
                  </div>
                </div>
                <div className="py-6">
                  <ApproversSection approvers={audit.approvers} approverFlow={audit.approverFlow} />
                </div>
                <div className="py-6">
                  <LocationAndAssetsSection location={audit.location} />
                </div>
                <div className="pt-6">
                  <TimelineSection activity={audit.activity} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
