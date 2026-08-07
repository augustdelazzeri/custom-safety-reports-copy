"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
import { useRouter } from 'next/navigation';
import { trpc } from '@/providers/trpc';

export default function EditOshaReport({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: report, isLoading } = trpc.oshaReport.getByIdForEdit.useQuery({ id: params.id });

  if (isLoading || !report) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={`Edit OSHA: ${report.slug}`} />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Edit Case: {report.slug}</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">1</span>
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Name <span className="text-red-500">*</span></Label>
                    <Input defaultValue={report.employeeName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title <span className="text-red-500">*</span></Label>
                    <Input defaultValue={report.employeeJobTitle} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">2</span>
                  Injury Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2">
                  <Label>Body Part Affected <span className="text-red-500">*</span></Label>
                  <Input defaultValue={report.bodyPartInjured} />
                </div>
                <div className="space-y-2">
                  <Label>Type of Injury <span className="text-red-500">*</span></Label>
                  <Input defaultValue={report.typeOfInjury} />
                </div>
                <OshaTypeSelect />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button className="bg-primary">
                <Save className="mr-2 h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
