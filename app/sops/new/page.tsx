"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Sparkles, ClipboardList } from 'lucide-react';
import { 
  AsyncLocationSelect, 
  AsyncAssetSelect, 
  AsyncUserSelect,
  ApproversSelector
} from '@/components/audit/upsert/mocks';
import { 
  StepIndicator,
  StepProgress,
  SopSteps,
  StepFooter,
  Scoped,
  StepValidationAlert
} from '@/components/sop/mocks';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export default function NewSop() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="New SOP" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <Scoped>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:px-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">New Standard Operating Procedure</h1>
                    </div>
                    <StepIndicator />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-8">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label>SOP Title <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. Boiler Startup Procedure" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Owner <span className="text-red-500">*</span></Label>
                        <AsyncUserSelect placeholder="Select owner..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <AsyncLocationSelect placeholder="Select location..." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Linked JHA</Label>
                        <Input placeholder="Search JHAs..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Review Date</Label>
                        <DateTimePicker placeholder="Select date..." />
                      </div>
                    </div>
                  </div>
                </div>

                <StepProgress />
                <StepValidationAlert />
                <SopSteps />
                
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
                  <ApproversSelector title="Approval Workflow" description="Select people to approve this procedure." />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" className="h-11 px-6">
                    <Save className="mr-2 h-4 w-4" /> Save as Draft
                  </Button>
                  <Button className="h-11 px-8 bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="mr-2 h-4 w-4" /> Submit for Review
                  </Button>
                </div>
              </div>
            </div>
          </Scoped>
        </main>
      </div>
    </div>
  );
}
