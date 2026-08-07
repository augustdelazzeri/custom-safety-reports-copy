"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/providers/trpc';
import { 
  DocumentsOverview, 
  BothTabs, 
  CaptureEventTab,
  PublicScanNotAvailable 
} from '@/components/public-scan/mocks';

export default function PublicQrScan() {
  const params = useParams();
  const accessPointId = params?.id as string;

  const {
    data: accessPoint,
    isLoading,
    isError,
  } = trpc.accessPoint.getByIdPublic.useQuery({ id: accessPointId }, { enabled: !!accessPointId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !accessPoint) {
    return <PublicScanNotAvailable />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      {accessPoint.type === 'event' && (
        <CaptureEventTab accessPoint={accessPoint} />
      )}
      {accessPoint.type === 'both' && (
        <BothTabs accessPoint={accessPoint} accessPointId={accessPointId} upkeepCompanyId={accessPoint.upkeepCompanyId} />
      )}
      {accessPoint.type === 'documentation' && (
        <DocumentsOverview accessPoint={accessPoint} />
      )}
    </div>
  );
}
