import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Link as LinkIcon, 
  MoreHorizontal,
  ChevronDown,
  History,
  CheckCircle,
  LayoutDashboard,
  SlidersHorizontal,
  Layers,
  Wrench,
  Sparkles,
  ClipboardCheck,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listInspectionTemplatesForAudit,
  createInspectionTemplateFromAudit,
  InspectionTemplate
} from '@/lib/inspectionStore';

export const GeneralInformationPanel = ({ type, description, locationName }: any) => (
  <Card className="border-gray-200 rounded-xl shadow-2xs overflow-hidden">
    <CardHeader className="bg-gray-50/30 border-b border-gray-100 py-3 px-6">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-gray-400" />
        <CardTitle className="text-sm font-bold text-gray-700">General Information</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Audit Type</span>
          <p className="text-sm font-semibold text-gray-800">{type || 'Safety Audit'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Location</span>
          <p className="text-sm font-semibold text-gray-800">{locationName || 'No location'}</p>
        </div>
      </div>
      <div className="space-y-1.5 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description / Scope</span>
        <p className="text-sm leading-relaxed text-gray-600 font-medium">
          {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

export const LinkedItemsPanel = ({ checklists, workOrders, pms, auditId, auditTitle }: any) => {
  const router = useRouter();
  const [isChecklistsOpen, setIsChecklistsOpen] = useState(true);
  const [isWorkOrdersOpen, setIsWorkOrdersOpen] = useState(true);
  const [isPMsOpen, setIsPMsOpen] = useState(true);

  // Inspection Templates state (stored per audit)
  const [inspectionTemplates, setInspectionTemplates] = useState<InspectionTemplate[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (auditId) {
      setInspectionTemplates(listInspectionTemplatesForAudit(auditId));
    }
  }, [auditId]);

  const handleCreateInspection = () => {
    setIsGeneratingAi(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      const newTemplate = createInspectionTemplateFromAudit(auditId || 'a8', auditTitle || 'Audit');
      setInspectionTemplates(listInspectionTemplatesForAudit(auditId || 'a8'));
      setIsGeneratingAi(false);
    }, 3200);
  };

  return (
    <Card className="border-gray-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Ai Generating Modal / Popup */}
      {isGeneratingAi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="size-16 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm relative">
              <Sparkles className="size-8 animate-pulse" />
              <div className="absolute -top-1 -right-1 size-4 rounded-full bg-blue-600 animate-ping" />
            </div>

            <div className="space-y-2">
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                AI Inspection Assistant
              </Badge>
              <h3 className="text-lg font-bold text-gray-900">Creating Inspection Template...</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                Artificial intelligence is analyzing your audit file and generating a simplified inspection template for factory workers.
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center gap-2">
              <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-gray-400">
                Closing in <span className="font-bold text-blue-600 text-sm">{countdown}</span> seconds...
              </p>
            </div>
          </div>
        </div>
      )}

      <CardHeader 
        className="bg-gray-50/30 border-b border-gray-100 py-3 px-6 cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsChecklistsOpen(!isChecklistsOpen)}
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="size-4 text-gray-400" />
          <CardTitle className="text-sm font-bold text-gray-700">Linked Items</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown className={cn("size-4 text-gray-400 transition-transform", !isChecklistsOpen && "-rotate-90")} />
        </div>
      </CardHeader>
      
      <CardContent className={cn("p-0 divide-y divide-gray-100", !isChecklistsOpen && "hidden")}>
        {/* Inspection Templates (New Category) */}
        <div className="p-6 space-y-4 bg-blue-50/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-md text-blue-600">
                <Sparkles className="size-3.5" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Inspection Templates</h4>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleCreateInspection}
                disabled={isGeneratingAi}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm gap-1.5"
              >
                <Sparkles className="size-3.5" />
                Create Inspection
              </Button>
            </div>
          </div>

          {inspectionTemplates.length > 0 ? (
            <div className="space-y-3">
              {inspectionTemplates.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => router.push(`/settings/safety-templates/${item.id}`)}
                  className="p-4 border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all rounded-xl shadow-2xs cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                      <ClipboardCheck className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h5>
                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-bold px-1.5 py-0 h-4 rounded-md gap-1">
                          <Bot className="size-2.5" /> AI Generated
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.tasks.length} Inspection Tasks • Simplifies floor inspection from Access Points
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 border-2 border-dashed border-blue-200/60 rounded-xl bg-white/60 flex flex-col items-center justify-center text-center space-y-2">
              <div className="size-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900">No Inspection Templates Linked</p>
                <p className="text-[11px] text-gray-500">
                  Click "Create Inspection" to generate an AI-assisted checklist for floor workers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Checklist Templates */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Checklist Templates</h4>
            <div className="flex items-center gap-2">
              <button className="text-xs font-bold text-blue-600 hover:underline">Create Template</button>
              <button className="text-xs font-bold text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50">+ Link to existing template</button>
            </div>
          </div>
          
          <div className="space-y-3">
            {checklists?.map((c: any) => (
              <div key={c.id} className="p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50/50 transition-colors flex items-start justify-between group">
                <div className="flex gap-3">
                  <div className="size-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-900">{c.name}</h5>
                    <p className="text-[11px] text-gray-500 leading-normal max-w-2xl">{c.description}</p>
                  </div>
                </div>
                <button className="size-8 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Work Orders */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Work Orders</h4>
            <div className="flex items-center gap-2">
              <button className="text-xs font-bold text-blue-600 hover:underline">Create Work Order</button>
              <button className="text-xs font-bold text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50">+ Link to existing work order</button>
            </div>
          </div>
          
          {workOrders?.length > 0 ? (
            <div className="space-y-3">
              {workOrders.map((wo: any) => (
                <div key={wo.id} className="p-4 border border-gray-200 rounded-xl bg-white flex items-center justify-between group">
                  <div className="flex gap-3 items-center">
                    <div className="size-2 rounded-full bg-blue-600 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">
                        {wo.workOrderNumber}: <span className="font-medium text-gray-600">{wo.description}</span>
                      </h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold tracking-wider">Due to: {wo.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Priority: {wo.priority}
                    </Badge>
                    <button className="size-8 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-10 bg-white rounded-lg shadow-2xs border border-gray-100 flex items-center justify-center">
                <Wrench className="size-5 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900">No Work Orders Linked</p>
                <p className="text-[11px] text-gray-400">Link an existing Work Order to this audit for tracking and reference.</p>
              </div>
            </div>
          )}
        </div>

        {/* Preventive Maintenance */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Preventive Maintenance</h4>
            <div className="flex items-center gap-2">
              <button className="text-xs font-bold text-blue-600 hover:underline">Create PM</button>
              <button className="text-xs font-bold text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50">+ Link to existing PM</button>
            </div>
          </div>
          
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">No PM Linked</p>
              <p className="text-[11px] text-gray-400">Link an existing Preventive Maintenance to this audit for tracking and reference.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AuditPersonnelSection = ({ owner }: any) => (
  <div className="space-y-4 pt-4">
    <div className="flex items-center gap-2 text-gray-400">
      <User className="size-4" />
      <h4 className="text-[11px] font-bold uppercase tracking-widest">Personnel</h4>
    </div>
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Owner</span>
        <p className="text-xs font-bold text-gray-900">{owner?.fullName}</p>
      </div>
    </div>
  </div>
);

export const ApproversSection = ({ approvers, approverFlow }: any) => {
  const approvedCount = approvers?.filter((a: any) => a.status === 'approved').length || 0;
  const totalCount = approvers?.length || 0;
  const progress = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Approval Workflow</h4>
        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 uppercase tracking-tighter shadow-2xs">
          <Layers className="size-2.5" />
          {approverFlow || 'Sequential'}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            <span>{approvedCount} of {totalCount} approved</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {approvers?.map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-emerald-500 border border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {i+1}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{a.approverName}</p>
                </div>
              </div>
              <div className="size-5 rounded-full border border-emerald-100 flex items-center justify-center bg-emerald-50">
                {a.status === 'approved' ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                ) : (
                  <Clock className="size-3 text-gray-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LocationAndAssetsSection = ({ location }: any) => (
  <div className="space-y-4 pt-2">
    <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Location and Assets</h4>
    <div className="flex items-start gap-2.5">
      <MapPin className="size-3.5 text-gray-300 mt-0.5 flex-shrink-0" />
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-gray-900">{location?.name || 'No location'}</p>
        <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
          <Badge className="bg-gray-100 text-gray-400 border-none text-[9px] size-4 p-0 flex items-center justify-center rounded-sm">A</Badge>
          No asset
        </p>
      </div>
    </div>
  </div>
);

export const TimelineSection = ({ activity }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="space-y-4 pt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400 group"
      >
        <span>Activity</span>
        <ChevronDown className={cn("size-3.5 transition-transform", !isOpen && "-rotate-90")} />
      </button>
      
      {isOpen && (
        <div className="relative pl-6 space-y-6 pt-2">
          {/* Vertical Line */}
          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-100" />
          
          {activity?.map((act: any, idx: number) => {
            const isFirst = idx === 0;
            const iconClass = act.type === 'Approved' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                             act.type === 'In Review' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                             'bg-blue-50 text-blue-500 border-blue-100';
            
            return (
              <div key={idx} className="relative">
                <div className={cn(
                  "absolute -left-[24.5px] top-0 size-6 rounded-full border-4 border-white flex items-center justify-center shadow-2xs z-10",
                  iconClass
                )}>
                  {act.type === 'Approved' ? <CheckCircle className="size-2.5" /> : 
                   act.type === 'In Review' ? <Clock className="size-2.5" /> :
                   act.type === 'Drafted' ? <FileText className="size-2.5" /> :
                   <div className="size-1 rounded-full bg-current" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-900">{act.type}</p>
                  <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1.5">
                    <Clock className="size-2.5" />
                    {act.date}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 pt-0.5">
                    <User className="size-2.5" />
                    {act.user}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AuditDetailsLoading = () => <div className="p-20 text-center space-y-4">
  <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
  <p className="text-sm font-bold text-gray-900">Loading audit details...</p>
</div>;

export const AuditDetailsError = () => <div className="p-20 text-center space-y-4">
  <div className="size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
    <AlertCircle className="size-6" />
  </div>
  <h3 className="text-lg font-bold text-gray-900">Failed to load audit</h3>
  <p className="text-sm text-gray-500 max-w-xs mx-auto">We couldn&apos;t retrieve the details for this safety audit. Please try again.</p>
  <Button variant="outline" className="rounded-xl">Back to Audits</Button>
</div>;

export const CustomFieldsPanel = () => null;
export const ChecklistPanel = () => null;
export const WorkOrderPanel = () => null;
export const DetailSidebar = ({ children }: any) => <div className="space-y-6">{children}</div>;
