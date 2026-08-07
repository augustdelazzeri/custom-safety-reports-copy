"use client";

import { 
  FormBuilder, 
  ConditionalLogicBuilder, 
  TemplatePreview,
  EditEventFormTemplateLoading, 
  EditEventFormTemplateError 
} from '@/components/event-form-template/mocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/providers/trpc';
import { ArrowLeft, Eye, Pencil, Save, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';

export default function EditEventFormTemplate() {
  const params = useParams();
  const templateId = params.templateId as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('fields');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const {
    data: template,
    isLoading,
    error,
  } = trpc.eventFormTemplate.getById.useQuery({ id: templateId });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
          <Header title="Safety Management" />
          <EditEventFormTemplateLoading />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
          <Header title="Safety Management" />
          <EditEventFormTemplateError />
        </div>
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
          <Header title="Safety Management" />
          <div className="flex items-center justify-between border-b bg-white px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsPreviewMode(false)}
                className="h-8 px-2 text-[11px] font-bold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-3 w-3 mr-1.5" />
                Back to Editor
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{template.name} Preview</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPreviewMode(false)}
                className="h-9 px-4 rounded-xl text-xs font-bold border-gray-200"
              >
                Close Preview
              </Button>
            </div>
          </div>
          <TemplatePreview name={template.name} fields={template.fields} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
        <Header title="Safety Management" />
        
        {/* Editor Header */}
        <div className="flex flex-col border-b bg-white sticky top-0 z-20">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">
              <span>Safety Management</span>
              <ChevronRight className="size-3" />
              <span className="text-gray-900">Edit Event Form Template</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/settings/safety-templates')}
                  className="h-7 px-2 text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3 mr-1.5" />
                  Safety Templates
                </Button>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900">{template.name}</h1>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-900"><Pencil className="size-3.5" /></Button>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                    <div className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Unsaved changes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs gap-2"
                  onClick={() => setIsPreviewMode(true)}
                >
                  <Eye className="size-3.5" />
                  Preview Form
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                  onClick={() => router.push('/settings/safety-templates')}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-none p-0 h-11 gap-8">
                <TabsTrigger 
                  value="fields" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-0 h-11 font-bold text-xs transition-all"
                >
                  Fields
                </TabsTrigger>
                <TabsTrigger 
                  value="logic" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-0 h-11 font-bold text-xs transition-all flex items-center gap-2"
                >
                  Logic
                  <Badge className="bg-blue-600 text-white text-[9px] size-4 p-0 flex items-center justify-center rounded-full">
                    {template.logic?.length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Editor Tabs Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={activeTab === 'fields' ? "flex-1 flex flex-col overflow-hidden" : "hidden"}>
            <FormBuilder fields={template.fields} />
          </div>
          <div className={activeTab === 'logic' ? "flex-1 flex flex-col overflow-hidden" : "hidden"}>
            <ConditionalLogicBuilder rules={template.logic} />
          </div>
        </div>
      </div>
    </div>
  );
}
