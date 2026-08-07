"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewCapaPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Create CAPA" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="container mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/capas')}>
                <ArrowLeft className="size-4 mr-2" />
                Back to Log
              </Button>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Create Corrective Action</h1>
              <p className="text-sm text-muted-foreground">Document a new corrective or preventive action.</p>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">General Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CAPA Title</label>
                  <Input placeholder="e.g. Repair damaged safety rail in Section B" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Input placeholder="Corrective, Preventive, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Input placeholder="Low, Medium, High" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Root Cause Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Findings</label>
                  <Textarea placeholder="Describe the findings of the root cause analysis..." rows={5} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Proposed Actions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Items</label>
                  <Textarea placeholder="List the actions required to address the root cause..." rows={5} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.push('/capas')}>Cancel</Button>
              <Button>Create CAPA</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
