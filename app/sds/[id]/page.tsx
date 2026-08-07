"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  MapPin, 
  ExternalLink,
  ArrowLeft,
  Calendar,
  Factory
} from 'lucide-react';
import { 
  SdsStatusBadge,
  SdsSignalWordBadge,
  GHSPictogramList,
  SdsLoading,
  SdsError,
  ReviewDateIndicator
} from '@/components/sds/mocks';
import { DetailSidebar } from '@/components/audit/details/mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function SdsDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: sds, isLoading, error } = trpc.sds.getById.useQuery({ id: params.id });

  if (isLoading || !sds) return <SdsLoading />;
  if (error) return <SdsError />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="SDS Details" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="sticky top-0 z-10 w-full border-b bg-white/95 p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => router.push('/sds')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Library
                  </Button>
                  <Badge variant="outline">{sds.slug}</Badge>
                  <SdsStatusBadge status={sds.status} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{sds.product}</h1>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" /> View PDF
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Factory className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium mr-1">Manufacturer:</span>
                {sds.manufacturer}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                <span className="font-medium mr-1">Revised:</span>
                {new Date(sds.revisionDate).toLocaleDateString()}
              </div>
              <div className="flex items-center border-l pl-6 border-gray-200">
                <SdsSignalWordBadge signalWord={sds.signalWord} />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-6 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                 <Card>
                   <CardHeader><CardTitle>GHS Classification</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Pictograms</span>
                        <GHSPictogramList pictograms={sds.pictograms} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Signal Word</span>
                        <SdsSignalWordBadge signalWord={sds.signalWord} />
                      </div>
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader><CardTitle>First Aid Measures</CardTitle></CardHeader>
                   <CardContent className="space-y-4 text-sm">
                      <div><span className="font-bold">Eyes:</span> {sds.firstAid.eyes}</div>
                      <div><span className="font-bold">Skin:</span> {sds.firstAid.skin}</div>
                      <div><span className="font-bold">Inhalation:</span> {sds.firstAid.inhalation}</div>
                      <div><span className="font-bold">Ingestion:</span> {sds.firstAid.ingestion}</div>
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader><CardTitle>Personal Protective Equipment</CardTitle></CardHeader>
                   <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {sds.ppe.map((item: string) => (
                          <Badge key={item} variant="secondary" className="bg-blue-50 text-blue-700">{item}</Badge>
                        ))}
                      </div>
                   </CardContent>
                 </Card>
              </div>

              <DetailSidebar>
                <Card className="p-6 space-y-6 text-sm">
                  <div>
                    <h3 className="font-bold uppercase mb-2">Product Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-muted-foreground">CAS: <span>{sds.casNumber}</span></div>
                      <div className="flex justify-between text-muted-foreground">Appearance: <span>{sds.appearance}</span></div>
                      <div className="flex justify-between text-muted-foreground">Flash Point: <span>{sds.flashPoint}</span></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="font-bold uppercase mb-2">Review Status</h3>
                    <ReviewDateIndicator date={sds.nextReviewDate} />
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
