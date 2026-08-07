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
  History, 
  Download, 
  User, 
  FileText, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Settings,
  ChevronsUpDown,
  ChevronsDownUp,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { 
  JhaRiskSummarySection,
  JhaDetailsLoading,
  JhaDetailsError,
  JhaVersionHistory
} from '@/components/jha/details-mocks';
import { 
  GeneralInformationPanel,
  ChecklistPanel,
  WorkOrderPanel,
  DetailSidebar,
  AuditPersonnelSection,
  ApproversSection,
  LocationAndAssetsSection,
  TimelineSection
} from '@/components/audit/details/mocks';
import { JhaRiskLevelBadge, JhaRiskScoreBadge } from '@/components/jha/risk-mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function JhaDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: jha, isLoading, error } = trpc.jha.getByInstanceId.useQuery({ id: params.id });

  if (isLoading || !jha) return <JhaDetailsLoading />;
  if (error) return <JhaDetailsError />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="JHA Details" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="sticky top-0 z-10 w-full border-b bg-white/95 p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => router.push('/jhas')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">{jha.slug}</Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">{jha.status}</Badge>
                  <Badge variant="outline" className="text-slate-500 font-mono text-[10px]">v{jha.version}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{jha.title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/jhas/${params.id}/edit`)}>
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
                {jha.owner?.fullName}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Last Reviewed:</span>
                {new Date(jha.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-600 mr-1">Next Review:</span>
                {new Date(jha.nextReviewDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-6 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Steps Section */}
                <Card className="overflow-hidden border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Task Steps & Risk Assessment</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm"><ChevronsUpDown className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {jha.steps.map((step: any) => (
                      <div key={step.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">{step.serial}</div>
                            <h4 className="font-bold">{step.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <JhaRiskScoreBadge score={step.severity * step.likelihoodAfterControl} />
                            <JhaRiskLevelBadge score={step.severity * step.likelihoodAfterControl} />
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <p className="text-sm text-gray-700">{step.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-red-50/50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-xs uppercase">
                                <AlertTriangle className="h-3 w-3" /> Hazards
                              </div>
                              {step.hazards.map((h: any) => (
                                <div key={h.id} className="text-sm flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {h.name}
                                </div>
                              ))}
                            </div>
                            <div className="bg-emerald-50/50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs uppercase">
                                <Shield className="h-3 w-3" /> Controls
                              </div>
                              {step.controlMeasures.map((c: any) => (
                                <div key={c.id} className="text-sm flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {c.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <GeneralInformationPanel 
                  type={jha.type} 
                  description={jha.description}
                  locationName={jha.location?.name}
                />
                <ChecklistPanel />
                <WorkOrderPanel />
              </div>

              <DetailSidebar>
                <JhaRiskSummarySection 
                  highestInitialRiskScore={jha.highestInitialRiskScore}
                  highestResidualRiskScore={jha.highestResidualRiskScore}
                  totalSteps={jha.steps.length}
                />
                <Card className="p-6">
                  <AuditPersonnelSection owner={jha.owner} />
                  <div className="my-6 border-t border-gray-100" />
                  <ApproversSection approvers={jha.approvers} />
                  <div className="my-6 border-t border-gray-100" />
                  <LocationAndAssetsSection location={jha.location} />
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
