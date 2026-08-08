"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/providers/trpc';
import { 
  DocumentsOverview, 
  BothTabs, 
  CaptureEventTab,
  DynamicScanTabs,
  PublicScanNotAvailable 
} from '@/components/public-scan/mocks';
import { InspectionFillView } from '@/components/inspection-template/mocks';
import { listInspectionTemplates, InspectionTemplate } from '@/lib/inspectionStore';

export default function PublicQrScan() {
  const params = useParams();
  const accessPointId = params?.id as string;

  const [inspectionTemplates, setInspectionTemplates] = useState<InspectionTemplate[]>([]);

  useEffect(() => {
    // Load any inspection templates stored in local browser state
    setInspectionTemplates(listInspectionTemplates());
  }, []);

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

  // Build dynamic tabs: Capture Event, View Documents, plus Inspection Tab
  const activeInspectionTemplate = inspectionTemplates[0] || {
    id: 'demo-insp',
    name: 'Forklift Safety Inspection Checklist',
    type: 'inspection',
    fieldsCount: 5,
    conditionsCount: 0,
    createdBy: 'AI Generator',
    createdAt: 'Today',
    tasks: [
      { id: 't1', label: 'Inspect Tires for Wear and Damage', taskType: 'Pass/Fail', photoRequired: true },
      { id: 't2', label: 'Check Forklift Brakes', taskType: 'Pass/Fail', noteRequired: true },
      { id: 't3', label: 'Test Steering Control', taskType: 'Pass/Fail' },
      { id: 't4', label: 'Technician Signature', taskType: 'Signature' },
    ]
  };

  const tabs = [];

  if (accessPoint.type === 'event' || accessPoint.type === 'both') {
    tabs.push({
      id: 'capture',
      label: 'Capture Event',
      component: <CaptureEventTab accessPoint={accessPoint} />
    });
  }

  if (accessPoint.type === 'documentation' || accessPoint.type === 'both') {
    tabs.push({
      id: 'documents',
      label: 'View Documents',
      component: <DocumentsOverview accessPoint={accessPoint} />
    });
  }

  // Inspection tab is always included so floor workers can test the checklist flow
  tabs.push({
    id: 'inspection',
    label: 'Inspection Checklist',
    component: <InspectionFillView template={activeInspectionTemplate as any} />
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <DynamicScanTabs tabs={tabs} />
    </div>
  );
}
