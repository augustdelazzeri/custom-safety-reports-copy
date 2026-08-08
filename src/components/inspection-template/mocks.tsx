"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Camera, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  Layers, 
  ChevronDown, 
  Check, 
  Sparkles,
  HelpCircle,
  UploadCloud,
  Type,
  Hash,
  List,
  PenTool,
  CheckSquare,
  MapPin,
  Box,
  User,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InspectionTemplate, InspectionTask } from '@/lib/inspectionStore';

export const InspectionChecklistBuilder = ({
  template,
  onChange,
}: {
  template: InspectionTemplate;
  onChange?: (updated: InspectionTemplate) => void;
}) => {
  const [tasks, setTasks] = useState<InspectionTask[]>(template.tasks || []);
  const [templateName, setTemplateName] = useState(template.name);
  const [description, setDescription] = useState('Write a description...');
  const [tags, setTags] = useState<string[]>(['Safety']);
  const [locations, setLocations] = useState<string[]>(['Chicago Plant']);
  const [assets, setAssets] = useState<string[]>(['Forklift #4']);
  const [users, setUsers] = useState<string[]>(['August Delazzeri']);

  const updateTasks = (newTasks: InspectionTask[]) => {
    setTasks(newTasks);
    if (onChange) {
      onChange({ ...template, name: templateName, tasks: newTasks });
    }
  };

  const handleAddTask = (type: InspectionTask['taskType'] = 'Pass/Fail') => {
    const newTask: InspectionTask = {
      id: `task-${Date.now()}`,
      label: 'New Inspection Item',
      taskType: type,
      photoRequired: false,
      noteRequired: false,
      urlRequired: false,
    };
    updateTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleToggleReq = (id: string, key: 'photoRequired' | 'noteRequired' | 'urlRequired') => {
    updateTasks(
      tasks.map((t) => (t.id === id ? { ...t, [key]: !t[key] } : t))
    );
  };

  const handleLabelChange = (id: string, label: string) => {
    updateTasks(
      tasks.map((t) => (t.id === id ? { ...t, label } : t))
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50/40">
      {/* Central Canvas */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {/* Header Title & Tags */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="space-y-2">
              <Input
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  if (onChange) onChange({ ...template, name: e.target.value, tasks });
                }}
                className="text-2xl font-bold border-none p-0 focus-visible:ring-0 shadow-none text-gray-900 h-auto"
                placeholder="Inspection Name"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs text-gray-500 border-none p-0 focus-visible:ring-0 shadow-none h-auto"
                placeholder="Write a description..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] font-semibold bg-gray-50 text-gray-600 border-gray-200 gap-1 rounded-lg px-2.5 py-1">
                    <Tag className="size-3 text-gray-400" />
                    {t}
                  </Badge>
                ))}
                <button className="text-[11px] font-bold text-gray-500 hover:text-gray-900 border border-dashed border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 flex items-center gap-1">
                  <Plus className="size-3" /> Tag
                </button>
              </div>

              {/* Location Association */}
              <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-gray-200">
                {locations.map((loc, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] font-semibold bg-blue-50 text-blue-700 border-blue-100 gap-1 rounded-lg px-2.5 py-1">
                    <MapPin className="size-3 text-blue-500" />
                    {loc}
                  </Badge>
                ))}
                <button className="text-[11px] font-bold text-gray-500 hover:text-gray-900 border border-dashed border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 flex items-center gap-1">
                  <Plus className="size-3" /> Location
                </button>
              </div>

              {/* Asset Association */}
              <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-gray-200">
                {assets.map((asset, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] font-semibold bg-amber-50 text-amber-700 border-amber-100 gap-1 rounded-lg px-2.5 py-1">
                    <Box className="size-3 text-amber-500" />
                    {asset}
                  </Badge>
                ))}
                <button className="text-[11px] font-bold text-gray-500 hover:text-gray-900 border border-dashed border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 flex items-center gap-1">
                  <Plus className="size-3" /> Asset
                </button>
              </div>

              {/* User Association */}
              <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-gray-200">
                {users.map((u, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-100 gap-1 rounded-lg px-2.5 py-1">
                    <User className="size-3 text-emerald-500" />
                    {u}
                  </Badge>
                ))}
                <button className="text-[11px] font-bold text-gray-500 hover:text-gray-900 border border-dashed border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 flex items-center gap-1">
                  <Plus className="size-3" /> Inspector/User
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs hover:border-gray-300 transition-all space-y-4 group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing pt-1">
                      <GripVertical className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={task.label}
                        onChange={(e) => handleLabelChange(task.id, e.target.value)}
                        className="font-bold text-sm text-gray-900 border-none p-0 focus-visible:ring-0 shadow-none h-auto"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold bg-gray-50 text-gray-600 border-gray-200 rounded-md">
                      {task.taskType}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="size-7 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Response Visual Preview */}
                {task.taskType === 'Pass/Fail' && (
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    <div className="h-9 rounded-xl bg-gray-100/80 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      Pass
                    </div>
                    <div className="h-9 rounded-xl bg-gray-100/80 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      Fail
                    </div>
                  </div>
                )}

                {task.taskType === 'Signature' && (
                  <div className="h-16 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center text-xs font-semibold text-gray-400">
                    Click here to sign
                  </div>
                )}

                {task.taskType === 'Text' && (
                  <div className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 flex items-center text-xs text-gray-400">
                    Response text...
                  </div>
                )}

                {/* Additional Requirements Togglers */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Additional Requirements</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleReq(task.id, 'photoRequired')}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                        task.photoRequired
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      <Camera className="size-3" />
                      Photo {task.photoRequired && '*'}
                    </button>

                    <button
                      onClick={() => handleToggleReq(task.id, 'noteRequired')}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                        task.noteRequired
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      <FileText className="size-3" />
                      Notes {task.noteRequired && '*'}
                    </button>

                    <button
                      onClick={() => handleToggleReq(task.id, 'urlRequired')}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                        task.urlRequired
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      <LinkIcon className="size-3" />
                      URL {task.urlRequired && '*'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => handleAddTask('Pass/Fail')}
              className="w-full h-12 border-dashed border-2 border-gray-200 rounded-2xl text-gray-500 font-bold text-xs hover:bg-gray-50 hover:border-gray-300 gap-2"
            >
              <Plus className="size-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Right Action Rail (Matching Reference UI) */}
      <div className="w-72 border-l bg-white flex flex-col p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Section Builder</h3>
          <p className="text-[11px] text-gray-500 leading-normal">Add items and response types to your inspection checklist.</p>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ADD ITEMS</span>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => handleAddTask('Pass/Fail')}
              className="w-full justify-start h-9 text-xs font-bold text-gray-700 rounded-xl border-gray-200 gap-2"
            >
              <Plus className="size-3.5 text-blue-600" />
              Add Task
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-9 text-xs font-bold text-gray-700 rounded-xl border-gray-200 gap-2"
            >
              <Layers className="size-3.5 text-blue-600" />
              Add Section
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TASK TYPES</span>
          <div className="space-y-1.5">
            {[
              { label: 'Pass/Fail', icon: <CheckSquare className="size-3.5 text-blue-600" />, type: 'Pass/Fail' },
              { label: 'Text', icon: <Type className="size-3.5 text-blue-600" />, type: 'Text' },
              { label: 'Number', icon: <Hash className="size-3.5 text-blue-600" />, type: 'Number' },
              { label: 'Signature', icon: <PenTool className="size-3.5 text-blue-600" />, type: 'Signature' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleAddTask(item.type as any)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-xs font-semibold text-gray-700 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <Plus className="size-3.5 text-gray-300 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const InspectionFillView = ({
  template,
  onSubmit,
}: {
  template: InspectionTemplate;
  onSubmit?: () => void;
}) => {
  const [answers, setAnswers] = useState<Record<string, 'Pass' | 'Fail' | string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mediaAttached, setMediaAttached] = useState<Record<string, boolean>>({});
  const [failReasons, setFailReasons] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<string[]>([]);

  const handleSelectAnswer = (taskId: string, val: 'Pass' | 'Fail') => {
    setAnswers((prev) => ({ ...prev, [taskId]: val }));
    setErrorMessage(null);
  };

  const handleTextAnswer = (taskId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [taskId]: val }));
    setErrorMessage(null);
  };

  const handleToggleMockMedia = (taskId: string) => {
    setMediaAttached((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    setErrorMessage(null);

    // Validation pass
    const newEventsCreated: string[] = [];

    for (const task of template.tasks) {
      const status = answers[task.id];

      // Check required photo
      if (task.photoRequired && !mediaAttached[task.id]) {
        setErrorMessage(`Photo attachment is required for "${task.label}". Click the camera button to mock upload.`);
        return;
      }

      // Check required note
      if (task.noteRequired && (!notes[task.id] || !notes[task.id].trim())) {
        setErrorMessage(`A written note is required for "${task.label}". Please fill in the note field.`);
        return;
      }

      // Check Fail justification for Safety Event creation
      if (status === 'Fail') {
        const reason = failReasons[task.id];
        if (!reason || !reason.trim()) {
          setErrorMessage(`Please describe why "${task.label}" failed. This failure description is required to automatically trigger an associated Safety Event.`);
          return;
        }
        newEventsCreated.push(`Safety Event: Near-Miss Observation for "${task.label}" - ${reason}`);
      }
    }

    setCreatedEvents(newEventsCreated);
    setSubmitted(true);
    if (onSubmit) onSubmit();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-6 space-y-2">
        <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[10px] font-bold rounded-md px-2">
          Floor Inspection Mode
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        <p className="text-xs text-gray-500">
          Complete the inspection items below and submit your report once verified.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
          <AlertTriangle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold uppercase tracking-wide">Validation Error</h5>
            <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
          <div className="size-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">Inspection Submitted Successfully</h3>
            <p className="text-xs text-gray-600">
              Thank you for completing this floor safety checklist. Your responses have been recorded.
            </p>
          </div>

          {createdEvents.length > 0 && (
            <div className="mt-4 p-4 bg-white border border-amber-200 rounded-xl text-left space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="size-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Associated Safety Events Created</h4>
              </div>
              <ul className="space-y-1.5 pt-1">
                {createdEvents.map((evt, idx) => (
                  <li key={idx} className="text-xs font-medium text-gray-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
                    <span>{evt}</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold">Linked Event</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setCreatedEvents([]);
            }}
            className="mt-2 text-xs font-bold border-gray-200 rounded-xl"
          >
            Fill Out Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {template.tasks.map((task) => {
            const isFailed = answers[task.id] === 'Fail';

            return (
              <div
                key={task.id}
                className={cn(
                  "bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all",
                  isFailed ? "border-red-300 ring-1 ring-red-100 bg-red-50/10" : "border-gray-200"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{task.label}</h4>
                    <Badge variant="outline" className="text-[10px] font-bold bg-gray-50 text-gray-500 border-gray-200">
                      {task.taskType}
                    </Badge>
                  </div>
                </div>

                {/* Input Control */}
                {task.taskType === 'Pass/Fail' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(task.id, 'Pass')}
                      className={cn(
                        "h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border",
                        answers[task.id] === 'Pass'
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <CheckCircle2 className="size-4" /> Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(task.id, 'Fail')}
                      className={cn(
                        "h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border",
                        answers[task.id] === 'Fail'
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <XCircle className="size-4" /> Fail
                    </button>
                  </div>
                )}

                {task.taskType === 'Text' && (
                  <Input
                    value={answers[task.id] || ''}
                    onChange={(e) => handleTextAnswer(task.id, e.target.value)}
                    placeholder="Type your notes or observation..."
                    className="h-11 rounded-xl border-gray-200 bg-gray-50/50 text-xs"
                  />
                )}

                {task.taskType === 'Signature' && (
                  <div 
                    onClick={() => handleTextAnswer(task.id, 'Signed by Technician')}
                    className={cn(
                      "h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-xs font-semibold cursor-pointer transition-colors",
                      answers[task.id] === 'Signed by Technician'
                        ? "border-emerald-500 bg-emerald-50/40 text-emerald-700"
                        : "border-gray-200 bg-gray-50/50 text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <PenTool className="size-5 mb-1" />
                    {answers[task.id] === 'Signed by Technician' ? 'Signature Recorded ✓' : 'Tap to sign'}
                  </div>
                )}

                {/* Photo & Note Inputs / Triggers */}
                <div className="space-y-3 pt-1 border-t border-gray-100">
                  {/* Note Input */}
                  {(task.noteRequired || isFailed) && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                        <FileText className="size-3.5 text-gray-400" />
                        {isFailed ? 'Failure Description / Justification' : 'Note / Comments'}
                        {(task.noteRequired || isFailed) && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={isFailed ? (failReasons[task.id] || '') : (notes[task.id] || '')}
                        onChange={(e) => {
                          if (isFailed) {
                            setFailReasons((prev) => ({ ...prev, [task.id]: e.target.value }));
                          } else {
                            setNotes((prev) => ({ ...prev, [task.id]: e.target.value }));
                          }
                          setErrorMessage(null);
                        }}
                        rows={2}
                        placeholder={
                          isFailed
                            ? 'Describe what failed... This will automatically generate a Safety Event.'
                            : 'Enter required notes here...'
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Photo / Media Mock Attacher */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleMockMedia(task.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors",
                          mediaAttached[task.id]
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <Camera className="size-3.5" />
                        {mediaAttached[task.id] ? 'Photo Attached ✓' : 'Attach Photo'}
                        {task.photoRequired && <span className="text-red-500">*</span>}
                      </button>
                    </div>

                    {task.photoRequired && !mediaAttached[task.id] && (
                      <span className="text-[10px] text-red-500 font-semibold">* Photo required</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm"
          >
            Submit Inspection Report
          </Button>
        </div>
      )}
    </div>
  );
};
