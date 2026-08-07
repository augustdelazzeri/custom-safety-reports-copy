"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Bot, ScrollText, Settings } from 'lucide-react';
import { 
  OrganizationTab,
  RegulatoryFrameworksTab,
  CustomAiInstructionsTab
} from '@/components/company-metadata/mocks';
import { trpc } from '@/providers/trpc';

export default function CompanyMetadataLog() {
  const { data: companyMetadata, isLoading } = trpc.companyMetadata.get.useQuery();

  if (isLoading) return <div className="p-8 text-center italic">Loading settings...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Company Settings" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Settings className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your organization's core configuration and AI behavior.</p>
            </div>
          </div>

          <Tabs defaultValue="organization" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="organization" className="gap-1.5">
                <Building className="size-4" /> Organization
              </TabsTrigger>
              <TabsTrigger value="regulatory" className="gap-1.5">
                <ScrollText className="size-4" /> Regulatory
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Bot className="size-4" /> AI Configuration
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
        </main>
      </div>
    </div>
  );
}
