"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  HardHat, 
  MapPin, 
  User,
  ArrowLeft
} from 'lucide-react';
import { 
  WorkOrderAISummary,
  WorkOrderStatusBadge,
  SafetyWorkOrderDetailsLoading,
  SafetyWorkOrderDetailsError
} from '@/components/work-orders/mocks';
import { DetailSidebar } from '@/components/audit/details/mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function SafetyWorkOrderDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: wo, isLoading, error } = trpc.workOrder.getWorkOrderById.useQuery({ workOrderId: params.id });

  if (isLoading || !wo) return <SafetyWorkOrderDetailsLoading />;
  if (error) return <SafetyWorkOrderDetailsError />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Work Order Details" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="sticky top-0 z-10 w-full border-b bg-white/95 p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => router.push('/safety-work-orders')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Badge variant="secondary">{wo.workOrderNumber}</Badge>
                  <WorkOrderStatusBadge status={wo.currentStatus} />
                  <Badge variant="outline">{wo.categoryType}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{wo.mainDescription}</h1>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" /> View in CMMS
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium mr-1">Assigned:</span>
                {wo.userAssignedTo?.firstName} {wo.userAssignedTo?.lastName}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium mr-1">Due:</span>
                {new Date(wo.dueDate).toLocaleDateString()}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                <span>{wo.duration} mins</span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-6 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <WorkOrderAISummary analysis={wo.analysis?.analysis} />
                
                {wo.note && (
                  <Card>
                    <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                    <CardContent className="bg-slate-50 p-4 rounded border text-sm leading-relaxed">
                      {wo.note}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground">Priority</label>
                      <div className="mt-1 font-semibold text-red-600">P{wo.priorityNumber} - High</div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                      <div className="mt-1 font-semibold">{wo.categoryType}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DetailSidebar>
                <Card className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase mb-3">Location & Asset</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{wo.objectLocationForWorkOrder?.stringName}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <HardHat className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{wo.objectAsset?.Name}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </DetailSidebar>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
