"use client";

import React from 'react';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage, RdCard } from '@/components/redesign/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
import { 
  WritingAssistant,
  OshaTypeSelect
} from '@/components/osha/mocks';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/providers/trpc';

export default function EditOshaReport() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: report, isLoading } = trpc.oshaReport.getByIdForEdit.useQuery({ id: params.id });

  if (isLoading || !report) return <PageShell title="Edit OSHA case" mainClassName="p-0"><RdPage title="Edit OSHA case" subtitle="Loading..."><></></RdPage></PageShell>;

  return (
    <PageShell title={`Edit case: ${report.slug}`} mainClassName="p-0">
      <RdPage record onBack={() => router.back()} title={`Edit case: ${report.slug}`}>
          <div className="w-full max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Name <span className="text-muted-foreground">*</span></Label>
                    <Input defaultValue={report.employeeName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title <span className="text-muted-foreground">*</span></Label>
                    <Input defaultValue={report.employeeJobTitle} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                  Injury Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2">
                  <Label>Body Part Affected <span className="text-muted-foreground">*</span></Label>
                  <Input defaultValue={report.bodyPartInjured} />
                </div>
                <div className="space-y-2">
                  <Label>Type of Injury <span className="text-muted-foreground">*</span></Label>
                  <Input defaultValue={report.typeOfInjury} />
                </div>
                <OshaTypeSelect />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button>
                <Save className="mr-2 h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>
      </RdPage>
    </PageShell>
  );
}
