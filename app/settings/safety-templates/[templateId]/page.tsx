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
import { ArrowLeft, Pencil, Save, X, Columns, Bot, Sparkles, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageShell } from '@/components/three-cases/shell';
import { figmaButton } from '@/components/redesign/ui';
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
      <PageShell title="Settings" mainClassName="p-0">
          <EditEventFormTemplateLoading />
        </PageShell>
    );
  }

  if (error || !activeTemplate) {
    return (
      <PageShell title="Settings" mainClassName="p-0">
          <EditEventFormTemplateError />
        </PageShell>
    );
  }

  return (
    <PageShell title="Settings" mainClassName="p-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Editor header */}
        <div className="flex flex-col gap-4 border-b border-border bg-card px-[var(--lab-gutter)] py-4">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/settings/safety-templates')} className="w-fit gap-2 rounded-lg px-3 text-sm text-foreground hover:bg-muted">
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold leading-6 text-foreground">{activeTemplate.name}</h1>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Rename"><Pencil className="size-4" /></Button>
              <span className="flex items-center gap-1.5 rounded-full bg-badge-warning px-2 py-0.5 text-xs font-medium text-badge-warning-foreground">
                <span className="size-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={isSplitPreview ? 'secondary' : 'outline'} className={figmaButton} onClick={() => setIsSplitPreview(!isSplitPreview)}>
                <Columns aria-hidden />
                {isSplitPreview ? 'Exit split view' : 'Split preview'}
              </Button>
              <Button variant={isAiAssistantOpen ? 'secondary' : 'outline'} className={figmaButton} onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}>
                <Sparkles aria-hidden />
                AI assistant
              </Button>
              <Button variant="ghost" className={figmaButton} onClick={() => router.push('/settings/safety-templates')}>
                Cancel
              </Button>
              <Button
                className={figmaButton}
                onClick={() => {
                  if (activeTemplate.type === 'inspection') {
                    saveInspectionTemplate(activeTemplate);
                  }
                  router.push('/settings/safety-templates');
                }}
              >
                Save changes
              </Button>
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
                <div className="px-[var(--lab-gutter)] bg-card border-t border-border">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-transparent border-none p-0 h-11 gap-8">
                      <TabsTrigger 
                        value="fields" 
                        className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 h-11 font-bold text-xs transition-all"
                      >
                        Fields
                      </TabsTrigger>
                      <TabsTrigger 
                        value="logic" 
                        className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 h-11 font-bold text-xs transition-all flex items-center gap-2"
                      >
                        Logic
                        <Badge className="bg-primary text-primary-foreground text-xs size-4 p-0 flex items-center justify-center rounded-full">
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
            <div className="w-1/2 border-l border-border bg-muted flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-badge-accent text-badge-accent-foreground border-border font-bold text-xs">Live Preview Pane</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">Updates live as you edit</span>
                </div>
                <Button variant="ghost" size="icon" className="size-7 text-text-subtle" onClick={() => setIsSplitPreview(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto bg-card p-4">
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
            <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden  animate-in slide-in-from-right duration-200">
              <div className="p-4 bg-surface-subtle text-foreground border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h3 className="text-xs font-bold ">AI Template Copilot</h3>
                </div>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => setIsAiAssistantOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col space-y-1 text-xs max-w-[88%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <span className="text-xs font-bold text-text-subtle ">
                      {msg.role === 'user' ? 'You' : 'AI Copilot'}
                    </span>
                    <div className={cn("p-3 rounded-2xl leading-relaxed ", msg.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none font-medium" : "bg-muted text-foreground rounded-bl-none font-medium")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t bg-muted/50 space-y-2">
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
                    className="h-9 text-xs rounded-xl bg-card border-border "
                  />
                  <Button type="submit" size="icon" className="size-9 rounded-xl bg-primary text-primary-foreground shrink-0">
                    <Send className="size-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
