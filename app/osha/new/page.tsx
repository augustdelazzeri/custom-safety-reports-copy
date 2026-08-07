"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="New OSHA Case" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">New OSHA Recordable Case</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">1</span>
                  Employee Information
                </CardTitle>
                <CardDescription>Details about the person involved in the incident.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title <span className="text-red-500">*</span></Label>
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
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">2</span>
                  Injury Details
                </CardTitle>
                <CardDescription>Nature and treatment of the injury or illness.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2">
                  <Label>Body Part Affected <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g. Right Shoulder" />
                </div>
                <div className="space-y-2">
                  <Label>Type of Injury <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g. Laceration" />
                </div>
                <OshaTypeSelect />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">3</span>
                  Root Cause Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WritingAssistant placeholder="Describe the underlying causes..." />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button className="bg-primary">
                <Save className="mr-2 h-4 w-4" /> Save OSHA Form
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
