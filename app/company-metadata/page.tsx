"use client";

import React from 'react';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage } from '@/components/redesign/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Bot, ScrollText } from 'lucide-react';
import { 
  OrganizationTab,
  RegulatoryFrameworksTab,
  CustomAiInstructionsTab
} from '@/components/company-metadata/mocks';
import { trpc } from '@/providers/trpc';

export default function CompanyMetadataLog() {
  const { data: companyMetadata, isLoading } = trpc.companyMetadata.get.useQuery();

  if (isLoading) return <PageShell title="Company settings" mainClassName="p-0"><RdPage title="Company settings" subtitle="Loading settings..."><></></RdPage></PageShell>;

  return (
    <PageShell title="Company settings" mainClassName="p-0">
      <RdPage title="Company settings" subtitle="Manage your organization's core configuration and AI behavior.">
          <Tabs defaultValue="organization" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="organization" className="gap-1.5">
                <Building className="size-4" /> Organization
              </TabsTrigger>
              <TabsTrigger value="regulatory" className="gap-1.5">
                <ScrollText className="size-4" /> Regulatory
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Bot className="size-4" /> AI configuration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="organization">
              <OrganizationTab companyMetadata={companyMetadata} />
            </TabsContent>

            <TabsContent value="regulatory">
              <RegulatoryFrameworksTab />
            </TabsContent>

            <TabsContent value="ai">
              <CustomAiInstructionsTab />
            </TabsContent>
          </Tabs>
      </RdPage>
    </PageShell>
  );
}
