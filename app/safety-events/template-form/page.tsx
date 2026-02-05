"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import SafetyEventFormRuntime from "../../../src/components/SafetyEventFormRuntime";
import TemplateSelector from "../../../src/components/TemplateSelector";
import { TemplateProvider, useTemplate } from "../../../src/contexts/TemplateContext";

function TemplateFormContent({ templateId }: { templateId?: string | null }) {
  const { getTemplate, selectedTemplateId } = useTemplate();
  const currentTemplate = getTemplate();
  const finalTemplateId = templateId || selectedTemplateId;
  
  return (
    <div className="ml-64">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <SafetyEventFormRuntime useCustomTemplate={true} />
      </main>
    </div>
  );
}

function TemplateFormPageInner() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const templateIdsParam = searchParams.get("templateIds");
  const accessPointId = searchParams.get("accessPointId") || undefined;
  const location = searchParams.get("location") || undefined;
  const asset = searchParams.get("asset") || undefined;

  // Handle multiple templates
  if (templateIdsParam && !templateId) {
    const templateIds = templateIdsParam.split(',').filter(Boolean);
    if (templateIds.length > 1) {
      // Show template selector
      return (
        <TemplateProvider>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <TemplateSelector 
              templateIds={templateIds}
              accessPointId={accessPointId}
              location={location}
              asset={asset}
            />
          </div>
        </TemplateProvider>
      );
    } else if (templateIds.length === 1) {
      // Single template, redirect to single template flow
      const params = new URLSearchParams();
      params.set('templateId', templateIds[0]);
      if (accessPointId) params.set('accessPointId', accessPointId);
      if (location) params.set('location', location);
      if (asset) params.set('asset', asset);
      // Use the single templateId flow below
      const finalTemplateId = templateIds[0];
      return (
        <TemplateProvider selectedTemplateId={finalTemplateId}>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <TemplateFormContent templateId={finalTemplateId} />
          </div>
        </TemplateProvider>
      );
    }
  }

  // Single template flow (backward compatible)
  const finalTemplateId = templateId || "injury-report";

  return (
    <TemplateProvider selectedTemplateId={finalTemplateId}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <TemplateFormContent templateId={finalTemplateId} />
      </div>
    </TemplateProvider>
  );
}

export default function TemplateFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TemplateFormPageInner />
    </Suspense>
  );
}
