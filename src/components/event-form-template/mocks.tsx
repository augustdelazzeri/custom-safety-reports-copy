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
  ChevronRight
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
        { label: 'Title', icon: <Type className="size-4" /> },
        { label: 'Time of Event', icon: <Calendar className="size-4" /> },
        { label: 'Description', icon: <AlignLeft className="size-4" /> },
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
        { label: 'Supervisor Name', icon: <Plus className="size-4" /> },
      ]
    }
  ];

  const coreFields = fields?.filter((f: any) => f.section === 'core') || [];
  const additionalFields = fields?.filter((f: any) => f.section === 'additional') || [];

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
                  <div key={item.label} className="group flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-grab active:cursor-grabbing shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 group-hover:text-blue-600">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <Plus className="size-3.5 text-gray-300 group-hover:text-blue-500" />
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
          </div>
        </div>
      </div>

      {/* Settings (Right) */}
      <div className="w-80 border-l bg-white flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-sm font-bold text-gray-900">Field Settings</h3>
          <p className="text-[11px] text-gray-500 mt-1">Configure field properties</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          {!selectedFieldId ? (
            <div className="space-y-4">
              <div className="size-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mx-auto">
                <Settings className="size-6 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900">No field selected</p>
                <p className="text-[11px] text-gray-500 leading-normal">Select a field on the canvas to view and edit its properties</p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 text-left self-start overflow-y-auto">
              {/* This would be populated with field-specific settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Label</Label>
                  <Input defaultValue={fields.find((f: any) => f.id === selectedFieldId)?.label} className="h-9 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Helper Text</Label>
                  <Input defaultValue={fields.find((f: any) => f.id === selectedFieldId)?.description} className="h-9 text-xs" />
                </div>
                <div className="flex items-center justify-between py-2 border-t mt-4">
                  <Label className="text-xs font-bold text-gray-700">Required</Label>
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 size-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConditionalLogicBuilder = ({ rules }: any) => {
  const [showNewRule, setShowNewRule] = useState(false);

  return (
    <div className="flex-1 bg-gray-50/30 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Conditional Logic</h2>
          <p className="text-sm text-gray-500">Define rules to show/hide fields or change validation based on form values</p>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="h-10 px-4 rounded-xl border-gray-200 text-gray-700 font-bold text-xs gap-2"
            onClick={() => setShowNewRule(true)}
          >
            <Plus className="size-4" />
            Add Rule
          </Button>

          {showNewRule && (
            <Card className="border-2 border-blue-500 shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-white border-b py-3 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900">New Rule</CardTitle>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowNewRule(false)}>
                  <X className="size-4 text-gray-400" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">When this field</Label>
                      <Select>
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
                      <Select>
                        <SelectTrigger className="h-10 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select a field first" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="is_empty">Is empty</SelectItem>
                          <SelectItem value="is_not_empty">Is not empty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Then</Label>
                      <Select>
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
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">This field</Label>
                      <Select>
                        <SelectTrigger className="h-10 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="body_part">Body Part Affected</SelectItem>
                          <SelectItem value="gps">GPS Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <Button variant="ghost" className="text-xs font-bold" onClick={() => setShowNewRule(false)}>Cancel</Button>
                  <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Add Rule</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {rules?.map((rule: any) => (
              <div key={rule.id} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">When</span>
                    <Badge variant="outline" className="h-7 px-3 rounded-lg border-gray-200 bg-gray-50 text-gray-900 font-bold">{rule.whenField}</Badge>
                    <span className="text-sm font-bold text-blue-600 lowercase">{rule.operator}</span>
                  </div>
                  <ChevronRight className="size-4 text-gray-300" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Then</span>
                    <span className="text-sm font-bold text-emerald-600">{rule.thenAction}</span>
                    <Badge variant="outline" className="h-7 px-3 rounded-lg border-gray-200 bg-gray-50 text-gray-900 font-bold">{rule.targetField}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="size-9 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {!rules?.length && !showNewRule && (
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
