"use client";

import { 
  FormBuilder, 
  ConditionalLogicBuilder, 
  TemplatePreview,
  EditEventFormTemplateLoading, 
  EditEventFormTemplateError 
} from '@/components/event-form-template/mocks';
import { 
  InspectionChecklistBuilder, 
  InspectionFillView 
} from '@/components/inspection-template/mocks';
import { saveInspectionTemplate } from '@/lib/inspectionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/providers/trpc';
import { ArrowLeft, Eye, Pencil, Save, ChevronRight, X, Columns, Bot, Sparkles, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function EditEventFormTemplate() {
  const params = useParams();
  const templateId = params.templateId as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('fields');
  const [isSplitPreview, setIsSplitPreview] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hi! I am your EHS Safety Assistant. Describe what fields or checklist items you want to modify or add to this template.' }
  ]);

  const {
    data: initialTemplate,
    isLoading,
    error,
  } = trpc.eventFormTemplate.getById.useQuery({ id: templateId });

  // Live state synchronized between InspectionChecklistBuilder and InspectionFillView in Split Preview
  const [currentTemplateState, setCurrentTemplateState] = useState<any>(null);

  // Sync initial template state when templateId changes or when loaded
  useEffect(() => {
    if (initialTemplate) {
      setCurrentTemplateState(initialTemplate);
    }
  }, [initialTemplate?.id]);

  const activeTemplate = currentTemplateState || initialTemplate;

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

  if (error || !activeTemplate) {
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
                  <h1 className="text-xl font-bold tracking-tight text-gray-900">{activeTemplate.name}</h1>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-900"><Pencil className="size-3.5" /></Button>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                    <div className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Unsaved changes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-9 px-3 rounded-xl text-xs font-bold border-gray-200 shadow-2xs gap-1.5 transition-colors",
                    isSplitPreview ? "bg-blue-50 border-blue-200 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setIsSplitPreview(!isSplitPreview)}
                >
                  <Columns className="size-3.5" />
                  {isSplitPreview ? 'Exit Split View' : 'Split Preview'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-9 px-3 rounded-xl text-xs font-bold border-gray-200 shadow-2xs gap-1.5 transition-colors",
                    isAiAssistantOpen ? "bg-blue-600 text-white border-blue-600" : "text-blue-600 border-blue-200 hover:bg-blue-50"
                  )}
                  onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
                >
                  <Sparkles className="size-3.5" />
                  AI Assistant
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                  onClick={() => router.push('/settings/safety-templates')}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (activeTemplate.type === 'inspection') {
                      saveInspectionTemplate(activeTemplate);
                    }
                    router.push('/settings/safety-templates');
                  }}
                  className="h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* Main Editor Layout with Split-Screen & AI Assistant Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTemplate.type === 'inspection' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <InspectionChecklistBuilder 
                  template={activeTemplate} 
                  onChange={(updated) => setCurrentTemplateState(updated)}
                />
              </div>
            ) : (
              <>
                <div className="px-6 bg-white border-t border-gray-100">
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
                          {activeTemplate.logic?.length || 0}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Editor Tabs Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className={activeTab === 'fields' ? "flex-1 flex flex-col overflow-hidden" : "hidden"}>
                    <FormBuilder fields={activeTemplate.fields} />
                  </div>
                  <div className={activeTab === 'logic' ? "flex-1 flex flex-col overflow-hidden" : "hidden"}>
                    <ConditionalLogicBuilder rules={activeTemplate.logic} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Split-Screen Live Preview Pane */}
          {isSplitPreview && (
            <div className="w-1/2 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px]">Live Preview Pane</Badge>
                  <span className="text-xs font-semibold text-gray-500">Updates live as you edit</span>
                </div>
                <Button variant="ghost" size="icon" className="size-7 text-gray-400" onClick={() => setIsSplitPreview(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white p-4">
                {activeTemplate.type === 'inspection' ? (
                  <InspectionFillView template={activeTemplate} />
                ) : (
                  <TemplatePreview name={activeTemplate.name} fields={activeTemplate.fields} />
                )}
              </div>
            </div>
          )}

          {/* AI Chat Assistant Sidebar */}
          {isAiAssistantOpen && (
            <div className="w-80 border-l border-blue-100 bg-white flex flex-col overflow-hidden shadow-xl animate-in slide-in-from-right duration-200">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-300 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">AI Template Copilot</h3>
                </div>
                <Button variant="ghost" size="icon" className="size-7 text-white/80 hover:text-white hover:bg-white/10" onClick={() => setIsAiAssistantOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col space-y-1 text-xs max-w-[88%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'AI Copilot'}
                    </span>
                    <div className={cn("p-3 rounded-2xl leading-relaxed shadow-2xs", msg.role === 'user' ? "bg-blue-600 text-white rounded-br-none font-medium" : "bg-gray-100 text-gray-800 rounded-bl-none font-medium")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t bg-gray-50/50 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!aiPrompt.trim()) return;
                    const userText = aiPrompt;
                    setAiMessages((prev) => [...prev, { role: 'user', content: userText }]);
                    setAiPrompt('');
                    setTimeout(() => {
                      setAiMessages((prev) => [
                        ...prev,
                        { role: 'assistant', content: `Got it! Modified template according to "${userText}". Added new requirement field.` }
                      ]);
                    }, 1000);
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI to add tasks, change logic..."
                    className="h-9 text-xs rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500"
                  />
                  <Button type="submit" size="icon" className="size-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                    <Send className="size-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
