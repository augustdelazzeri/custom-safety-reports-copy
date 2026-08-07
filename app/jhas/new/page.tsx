"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Plus, Sparkles, Paperclip, ChevronDown } from 'lucide-react';
import { 
  AsyncLocationSelect, 
  AsyncAssetSelect, 
  AsyncUserSelect,
  MediaUploadCollapsible,
  ApproversSelector
} from '@/components/audit/upsert/mocks';
import { WritingAssistant } from '@/components/ui/writing-assistant';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { JhaSteps } from '@/components/jha/mocks';

export default function NewJha() {
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="New JHA" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:px-10">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">New Job Hazard Analysis</h2>
                <p className="text-gray-600">Create a detailed risk assessment for a specific task or job.</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-8">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-500">General JHA identification and ownership.</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label>JHA Title <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g. Working at Heights for Roof Repair" />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Reference ID</Label>
                      <Input placeholder="e.g. JHA-2026-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Owner <span className="text-red-500">*</span></Label>
                      <AsyncUserSelect placeholder="Select an owner..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <AsyncLocationSelect placeholder="Select location..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Assets</Label>
                      <AsyncAssetSelect placeholder="Select assets..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Review Date</Label>
                      <DateTimePicker placeholder="Select date..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <WritingAssistant placeholder="Add any additional notes or context..." className="min-h-[100px]" />
                  </div>
                </div>
              </div>

              <JhaSteps />

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                  <h3 className="text-lg font-bold text-gray-900">Approval Workflow</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Approval Flow Type</Label>
                    <RadioGroup defaultValue="parallel" className="grid gap-4">
                      <div className="flex items-start space-x-3 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="sequential" id="sequential" className="mt-1" />
                        <div className="grid gap-1">
                          <Label htmlFor="sequential" className="font-bold cursor-pointer">Sequential</Label>
                          <p className="text-sm text-gray-500">Approvers must review in order.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-xl border-2 border-blue-100 bg-blue-50/30 p-4">
                        <RadioGroupItem value="parallel" id="parallel" className="mt-1" />
                        <div className="grid gap-1">
                          <Label htmlFor="parallel" className="font-bold cursor-pointer">Parallel</Label>
                          <p className="text-sm text-gray-500">All approvers can review at the same time.</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <ApproversSelector title="Required Approvers" description="Add the people responsible for approving this JHA." />
                </div>
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
        </main>
      </div>
    </div>
  );
}
