"use client";

import React from 'react';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage, RdCard } from '@/components/redesign/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Save, ArrowLeft, HelpCircle } from 'lucide-react';
import { 
  WritingAssistant,
  OshaTypeSelect,
  StateSelect
} from '@/components/osha/mocks';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useRouter } from 'next/navigation';

export default function NewOshaReport() {
  const router = useRouter();

  return (
    <PageShell title="New OSHA recordable case" mainClassName="p-0">
      <RdPage record onBack={() => router.back()} title="New OSHA recordable case">
          <div className="w-full max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                  Employee Information
                </CardTitle>
                <CardDescription>Details about the person involved in the incident.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Name <span className="text-muted-foreground">*</span></Label>
                    <Input placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title <span className="text-muted-foreground">*</span></Label>
                    <Input placeholder="e.g. Forklift Operator" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Hire</Label>
                    <DateTimePicker onlyDate />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <Input placeholder="Select Shift" />
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
                <CardDescription>Nature and treatment of the injury or illness.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2">
                  <Label>Body Part Affected <span className="text-muted-foreground">*</span></Label>
                  <Input placeholder="e.g. Right Shoulder" />
                </div>
                <div className="space-y-2">
                  <Label>Type of Injury <span className="text-muted-foreground">*</span></Label>
                  <Input placeholder="e.g. Laceration" />
                </div>
                <OshaTypeSelect />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                  Root Cause Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WritingAssistant placeholder="Describe the underlying causes..." />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button>
                <Save className="mr-2 h-4 w-4" /> Save OSHA Form
              </Button>
            </div>
          </div>
      </RdPage>
    </PageShell>
  );
}
