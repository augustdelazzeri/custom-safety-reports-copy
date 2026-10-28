"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/three-cases/shell";
import { RdPage } from "@/components/redesign/ui";
import SafetyEventFormRuntime from "../../../src/components/SafetyEventFormRuntime";
import TemplateSelector from "../../../src/components/TemplateSelector";
import { TemplateProvider } from "../../../src/contexts/TemplateContext";

function TemplateFormContent() {
  return (
    <RdPage title="Report a safety event" subtitle="Fill in the form for the selected template.">
      <SafetyEventFormRuntime useCustomTemplate={true} />
    </RdPage>
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
          <PageShell title="Report safety event" mainClassName="p-0">
            <TemplateSelector 
              templateIds={templateIds}
              accessPointId={accessPointId}
              location={location}
              asset={asset}
            />
          </PageShell>
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
          <PageShell title="Report safety event" mainClassName="p-0">
            <TemplateFormContent />
          </PageShell>
        </TemplateProvider>
      );
    }
  }

  // Single template flow (backward compatible)
  const finalTemplateId = templateId || "injury-report";

  return (
    <TemplateProvider selectedTemplateId={finalTemplateId}>
      <PageShell title="Report safety event" mainClassName="p-0">
        <TemplateFormContent />
      </PageShell>
    </TemplateProvider>
  );
}

export default function TemplateFormPage() {
  return (
    <Suspense fallback={<PageShell title="Report safety event"><div /></PageShell>}>
      <TemplateFormPageInner />
    </Suspense>
  );
}
