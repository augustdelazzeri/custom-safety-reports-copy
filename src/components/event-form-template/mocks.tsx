"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  GripVertical, 
  Plus, 
  Lock, 
  Type, 
  Calendar, 
  AlignLeft, 
  MapPin, 
  ListChecks, 
  ChevronDown, 
  MoreHorizontal,
  X,
  Search,
  Users,
  Paperclip,
  Image as ImageIcon,
  Activity,
  Layers,
  Clock,
  Settings,
  ChevronRight,
  Check,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const FormBuilder = ({ fields }: any) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const sections = [
    {
      id: 'core-fields',
      label: 'CORE FIELDS',
      items: [
        { label: 'Title', icon: <Type className="size-4" />, locked: true },
        { label: 'Time of Event', icon: <Calendar className="size-4" />, locked: true },
        { label: 'Description', icon: <AlignLeft className="size-4" />, locked: true },
      ]
    },
    {
      id: 'basic-fields',
      label: 'BASIC FIELDS',
      items: [
        { label: 'Short Text', icon: <Type className="size-4" /> },
        { label: 'Long Text', icon: <AlignLeft className="size-4" /> },
        { label: 'Number', icon: <span className="font-bold text-[10px]">#</span> },
        { label: 'Dropdown', icon: <ChevronDown className="size-4" /> },
        { label: 'Multi-select', icon: <ListChecks className="size-4" /> },
        { label: 'Checkbox', icon: <div className="size-3 border border-current rounded-sm" /> },
        { label: 'Date/Time', icon: <Calendar className="size-4" /> },
        { label: 'File Upload', icon: <Paperclip className="size-4" /> },
      ]
    },
    {
      id: 'incident-details',
      label: 'INCIDENT DETAILS',
      items: [
        { label: 'Report Type', icon: <Activity className="size-4" /> },
        { label: 'Location', icon: <MapPin className="size-4" /> },
        { label: 'Assets', icon: <Layers className="size-4" /> },
        { label: 'Hazard Category', icon: <X className="size-4" /> },
        { label: 'Injury Details', icon: <Activity className="size-4" /> },
      ]
    },
    {
      id: 'sign-off',
      label: 'SIGN-OFF & REVIEW',
      items: [
        { label: 'Team Members to Notify', icon: <Plus className="size-4" /> },
        { label: 'Witnesses', icon: <Plus className="size-4" /> },
        { label: 'Reporter Name', icon: <Plus className="size-4" /> },
        { label: 'Reporter Role / Job Title', icon: <Plus className="size-4" /> },
        { label: 'Supervisor Name', icon: <Plus className="size-4" /> },
        { label: 'Supervisor Review Date', icon: <Plus className="size-4" /> },
        { label: 'Sign-off / Acknowledgement', icon: <Plus className="size-4" /> },
      ]
    },
    {
      id: 'diagrams',
      label: 'DIAGRAMS & SKETCHES',
      items: [
        { label: 'Body Diagram', icon: <Activity className="size-4" /> },
        { label: 'Scene / Crossroads Diagram', icon: <Plus className="size-4" /> },
        { label: 'Sketch / Drawing', icon: <Plus className="size-4" /> },
      ]
    }
  ];

  const coreFields = fields?.filter((f: any) => f.section === 'core') || [];
  const additionalFields = fields?.filter((f: any) => f.section === 'additional') || [];

  const handleAddField = () => {
    // Mock adding a field
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Palette (Left) */}
      <div className="w-72 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 size-3.5 text-gray-400" />
            <Input placeholder="Search fields..." className="pl-9 h-9 rounded-lg bg-gray-50/50 text-xs border-gray-200" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map(section => (
            <div key={section.id} className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{section.label}</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {section.items.map(item => (
                  <div 
                    key={item.label} 
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-lg border transition-all shadow-2xs",
                      (item as any).locked 
                        ? "bg-gray-50/50 border-gray-100 opacity-60 cursor-not-allowed" 
                        : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 group-hover:text-blue-600">
                        {(item as any).locked ? <Lock className="size-3.5" /> : item.icon}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                    </div>
                    {!(item as any).locked && <Plus className="size-3.5 text-gray-300 group-hover:text-blue-500" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas (Center) */}
      <div className="flex-1 bg-gray-50/50 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Form Canvas</h2>
            <p className="text-[11px] font-medium text-gray-500">Drag fields from the left palette to add them, or reorder existing fields</p>
          </div>

          {/* Core Fields Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="size-3.5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Core Fields (Required)</h3>
            </div>
            
            <div className="space-y-3">
              {coreFields.map((field: any) => (
                <div 
                  key={field.id} 
                  className={cn(
                    "p-4 border rounded-xl bg-white flex items-center justify-between group transition-all shadow-2xs",
                    selectedFieldId === field.id ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"
                  )}
                  onClick={() => setSelectedFieldId(field.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <Lock className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{field.label}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{field.type}</span>
                        <Badge className="bg-red-50 text-red-600 border-red-100 text-[9px] font-bold h-4 px-1.5 rounded-sm">Required</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500">{field.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-2 flex items-center justify-center">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Additional Fields</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Additional Fields Section */}
          <div className="space-y-3 min-h-[200px] border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
            {additionalFields.map((field: any) => (
              <div 
                key={field.id} 
                className={cn(
                  "p-4 border rounded-xl bg-white flex items-center justify-between group transition-all shadow-2xs cursor-pointer",
                  selectedFieldId === field.id ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setSelectedFieldId(field.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <GripVertical className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{field.label}</span>
                      <span className="text-[10px] text-gray-500 font-medium">{field.type}</span>
                      {field.required && <Badge className="bg-red-50 text-red-600 border-red-100 text-[9px] font-bold h-4 px-1.5 rounded-sm">Required</Badge>}
                    </div>
                    {field.description && <p className="text-[11px] text-gray-500">{field.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-red-500">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full h-12 border-dashed border-2 border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 hover:border-gray-300"
              onClick={handleAddField}
            >
              <Plus className="size-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>
      </div>

      {/* Settings (Right) */}
      <div className="w-80 border-l bg-white flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-900">Field Settings</h3>
            <p className="text-[11px] font-medium text-gray-500">Configure field properties</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-red-500">
              <Trash2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-gray-400" onClick={() => setSelectedFieldId(null)}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {!selectedFieldId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mx-auto">
                <Settings className="size-6 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900">No field selected</p>
                <p className="text-[11px] text-gray-500 leading-normal">Select a field on the canvas to view and edit its properties</p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 text-left">
              {/* Common Settings */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Label</Label>
                  <Input 
                    defaultValue={fields.find((f: any) => f.id === selectedFieldId)?.label} 
                    className="h-10 rounded-xl border-gray-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 transition-all" 
                    readOnly={fields.find((f: any) => f.id === selectedFieldId)?.section === 'core'}
                  />
                  {fields.find((f: any) => f.id === selectedFieldId)?.section === 'core' && (
                    <p className="text-[10px] text-gray-400 font-medium">Core field labels cannot be modified</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Help Text</Label>
                  <textarea 
                    defaultValue={fields.find((f: any) => f.id === selectedFieldId)?.description}
                    placeholder="Add help text for this field..."
                    className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-white p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-gray-700">Required Field</Label>
                    <p className="text-[10px] text-gray-400 font-medium">Make this field mandatory</p>
                  </div>
                  <div 
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                      fields.find((f: any) => f.id === selectedFieldId)?.required || fields.find((f: any) => f.id === selectedFieldId)?.section === 'core'
                        ? "bg-blue-600" 
                        : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 size-4 bg-white rounded-full transition-all shadow-sm",
                      fields.find((f: any) => f.id === selectedFieldId)?.required || fields.find((f: any) => f.id === selectedFieldId)?.section === 'core'
                        ? "right-0.5" 
                        : "left-0.5"
                    )} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Field Type</Label>
                  <div className="h-10 px-3 flex items-center bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 font-medium cursor-not-allowed">
                    {fields.find((f: any) => f.id === selectedFieldId)?.type}
                  </div>
                </div>

                {/* Options Section (for Dropdown/Multi-select) */}
                {(fields.find((f: any) => f.id === selectedFieldId)?.type === 'Dropdown' || 
                  fields.find((f: any) => f.id === selectedFieldId)?.type === 'Multi-select') && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-gray-700">Options</Label>
                      <button className="text-[11px] font-bold text-blue-600 hover:underline">+ Add Option</button>
                    </div>
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3'].map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                          <Input defaultValue={opt} className="h-9 rounded-lg border-gray-200 text-xs" />
                          <Button variant="ghost" size="icon" className="size-8 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConditionalLogicBuilder = ({ rules: initialRules }: any) => {
  const [rulesList, setRulesList] = useState<any[]>(
    initialRules?.length
      ? initialRules
      : [
          {
            id: 'l1',
            whenField: 'Title',
            operator: 'Is empty',
            thenAction: 'Show',
            targetFields: ['Body Part Affected', 'GPS Location'],
          },
        ]
  );
  const [showNewRule, setShowNewRule] = useState(false);
  const [selectedTargets, setSelectedFields] = useState<string[]>(['Body Part Affected']);

  const handleDuplicateRule = (ruleToDup: any) => {
    const newRule = {
      ...ruleToDup,
      id: `rule-${Date.now()}`,
      targetFields: [...(ruleToDup.targetFields || [ruleToDup.targetField])],
    };
    setRulesList([...rulesList, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRulesList(rulesList.filter((r) => r.id !== id));
  };

  const handleAddRuleSubmit = () => {
    const newRule = {
      id: `rule-${Date.now()}`,
      whenField: 'Title',
      operator: 'Is empty',
      thenAction: 'Show',
      targetFields: selectedTargets,
    };
    setRulesList([...rulesList, newRule]);
    setShowNewRule(false);
  };

  return (
    <div className="flex-1 bg-gray-50/30 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Conditional Logic</h2>
            <p className="text-sm text-gray-500">Define rules to show/hide multiple fields based on form values</p>
          </div>
          <Button 
            variant="outline" 
            className="h-10 px-4 rounded-xl border-gray-200 text-gray-700 font-bold text-xs gap-2 bg-white shadow-2xs"
            onClick={() => setShowNewRule(true)}
          >
            <Plus className="size-4 text-blue-600" />
            Add Rule
          </Button>
        </div>

        <div className="space-y-4">
          {showNewRule && (
            <Card className="border-2 border-blue-500 shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-white border-b py-3 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900">New Multi-Field Rule</CardTitle>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowNewRule(false)}>
                  <X className="size-4 text-gray-400" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">When this field</Label>
                      <Select defaultValue="title">
                        <SelectTrigger className="h-10 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="time">Time of Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Operator</Label>
                      <Select defaultValue="is_empty">
                        <SelectTrigger className="h-10 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="is_empty">Is empty</SelectItem>
                          <SelectItem value="is_not_empty">Is not empty</SelectItem>
                          <SelectItem value="equals">Equals Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Then</Label>
                      <Select defaultValue="show">
                        <SelectTrigger className="h-10 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select action..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show">Show</SelectItem>
                          <SelectItem value="hide">Hide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Apply to these fields (Multi-select)</Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['Body Part Affected', 'GPS Location', 'Injury Details', 'Supervisor Review'].map((fName) => {
                          const isSel = selectedTargets.includes(fName);
                          return (
                            <button
                              key={fName}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setSelectedFields(selectedTargets.filter((t) => t !== fName));
                                } else {
                                  setSelectedFields([...selectedTargets, fName]);
                                }
                              }}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5",
                                isSel
                                  ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                              )}
                            >
                              {fName}
                              {isSel && <Check className="size-3 text-blue-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <Button variant="ghost" className="text-xs font-bold" onClick={() => setShowNewRule(false)}>Cancel</Button>
                  <Button onClick={handleAddRuleSubmit} className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Add Multi-Field Rule</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {rulesList.map((rule) => {
              const targets = rule.targetFields || (rule.targetField ? [rule.targetField] : ['Body Part Affected']);

              return (
                <div key={rule.id} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between group hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">When</span>
                      <Badge variant="outline" className="h-7 px-3 rounded-lg border-gray-200 bg-gray-50 text-gray-900 font-bold">{rule.whenField}</Badge>
                      <span className="text-xs font-bold text-blue-600 lowercase">{rule.operator}</span>
                    </div>
                    <ChevronRight className="size-4 text-gray-300" />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Then</span>
                      <span className="text-xs font-bold text-emerald-600">{rule.thenAction}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {targets.map((tgt: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="h-7 px-2.5 rounded-lg border-blue-100 bg-blue-50/50 text-blue-900 font-bold text-xs">
                            {tgt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDuplicateRule(rule)}
                      className="h-8 px-2.5 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg gap-1.5"
                    >
                      <Copy className="size-3.5" /> Duplicate
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="size-8 text-gray-400 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {!rulesList.length && !showNewRule && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="size-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                  <Settings className="size-8 text-gray-300 rotate-90" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">No rules defined yet</h3>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Click "Add Rule" to create your first conditional logic rule.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplatePreview = ({ name, fields }: any) => (
  <div className="flex-1 bg-white overflow-y-auto">
    <div className="max-w-2xl mx-auto py-12 px-6 space-y-10">
      <div className="space-y-4 border-b pb-8">
        <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[10px] font-bold rounded-md px-2">Preview Mode</Badge>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500 italic">This is a preview of how the form will appear to users. You can interact with the fields and test validation, but no data will be saved.</p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-0 text-blue-600 font-bold hover:bg-transparent">
          ← Back to Editor
        </Button>
      </div>

      <div className="space-y-8 pb-20">
        {fields?.map((field: any) => (
          <div key={field.id} className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
              {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
            </div>
            {field.type === 'Text Area' ? (
              <textarea 
                placeholder={field.description}
                className="w-full min-h-[120px] rounded-xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" 
              />
            ) : field.type === 'GPS Location' ? (
              <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 text-gray-600 font-bold text-xs gap-2 bg-gray-50/50">
                <MapPin className="size-4" />
                Capture GPS Location
              </Button>
            ) : field.type === 'Date/Time' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
                  <Input placeholder="MM/DD/YYYY" className="h-11 pl-10 rounded-xl bg-gray-50/50 border-gray-200" />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
                  <Input placeholder="-- : -- --" className="h-11 pl-10 rounded-xl bg-gray-50/50 border-gray-200" />
                </div>
              </div>
            ) : (
              <Input 
                placeholder={field.description}
                className="h-11 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs" 
              />
            )}
            {field.description && !field.type.includes('Area') && <p className="text-[11px] text-gray-400 font-medium">{field.description}</p>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const EditEventFormTemplateLoading = () => <div className="p-20 text-center space-y-4">
  <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
  <p className="text-sm font-bold text-gray-900">Loading template editor...</p>
</div>;

export const EditEventFormTemplateError = () => <div className="p-20 text-center text-destructive font-bold">Error loading template.</div>;
