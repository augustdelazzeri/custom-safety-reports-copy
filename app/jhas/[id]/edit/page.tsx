"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Sparkles, ArrowLeft } from 'lucide-react';
import { 
  AsyncLocationSelect, 
  AsyncAssetSelect, 
  AsyncUserSelect,
  ApproversSelector
} from '@/components/audit/upsert/mocks';
import { WritingAssistant } from '@/components/ui/writing-assistant';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { JhaSteps } from '@/components/jha/mocks';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

export default function EditJha({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: jha, isLoading } = trpc.jha.getByInstanceIdForEdit.useQuery({ id: params.id });

  if (isLoading || !jha) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={`Edit JHA: ${jha.slug}`} />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:px-10">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Edit JHA</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{jha.slug}</Badge>
                    <Badge variant="secondary">Version {jha.version}</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label>JHA Title <span className="text-red-500">*</span></Label>
                    <Input defaultValue={jha.title} />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Reference ID</Label>
                      <Input defaultValue={jha.referenceId} />
                    </div>
                    <div className="space-y-2">
                      <Label>Owner <span className="text-red-500">*</span></Label>
                      <AsyncUserSelect defaultValue={jha.ownerId} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <WritingAssistant defaultValue={jha.notes} className="min-h-[100px]" />
                  </div>
                </div>
              </div>

              <JhaSteps />

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button variant="outline" className="h-11 px-6">
                  <Save className="mr-2 h-4 w-4" /> Save changes
                </Button>
                <Button className="h-11 px-8 bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="mr-2 h-4 w-4" /> Submit Revision
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
