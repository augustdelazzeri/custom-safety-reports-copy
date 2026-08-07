"use client";

import { 
  FormBuilder, 
  ConditionalLogicBuilder, 
  EditEventFormTemplateLoading 
} from '@/components/event-form-template/mocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/providers/trpc';
import { ArrowLeft, Eye, Save, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function NewEventFormTemplate() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('fields');
  const [name, setName] = useState('Untitled Template');

  const { mutateAsync: createTemplate, isPending: isCreating } = trpc.eventFormTemplate.create.useMutation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        {/* Editor Header */}
        <div className="flex items-center justify-between border-b bg-card px-6 py-4 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/settings/safety-templates')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-64 text-lg font-bold bg-transparent border-transparent hover:border-border focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" disabled><Eye className="size-4 mr-2" /> Preview</Button>
            <Button size="sm" onClick={() => createTemplate({ name })} disabled={isCreating}>
              <Save className="size-4 mr-2" /> Save Template
            </Button>
          </div>
        </div>

        {/* Editor Tabs */}
        <div className="bg-muted/5 flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 py-2 border-b bg-card">
              <TabsList className="bg-transparent border-none p-0 h-auto gap-8">
                <TabsTrigger value="fields" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 font-bold uppercase tracking-wider text-[10px]">Form Fields</TabsTrigger>
                <TabsTrigger value="logic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 font-bold uppercase tracking-wider text-[10px]">Conditional Logic</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="fields" className="flex-1 mt-0 overflow-hidden">
              <FormBuilder />
            </TabsContent>
            
            <TabsContent value="logic" className="flex-1 mt-0 overflow-hidden">
              <ConditionalLogicBuilder />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
