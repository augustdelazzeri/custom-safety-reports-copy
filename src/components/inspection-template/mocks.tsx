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
    <div className="flex-1 flex overflow-hidden bg-muted/40">
      {/* Central Canvas */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {/* Header Title & Tags */}
          <div className="bg-card border border-border rounded-2xl p-6  space-y-4">
            <div className="space-y-2">
              <Input
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  if (onChange) onChange({ ...template, name: e.target.value, tasks });
                }}
                className="text-2xl font-bold border-none p-0 focus-visible:ring-0 shadow-none text-foreground h-auto"
                placeholder="Inspection Name"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs text-muted-foreground0 border-none p-0 focus-visible:ring-0 shadow-none h-auto"
                placeholder="Write a description..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-semibold bg-muted text-muted-foreground border-border gap-1 rounded-lg px-2.5 py-1">
                    <Tag className="size-3 text-text-placeholder" />
                    {t}
                  </Badge>
                ))}
                <button className="text-xs font-bold text-muted-foreground0 hover:text-foreground border border-dashed border-border rounded-lg px-2.5 py-1 hover:bg-muted flex items-center gap-1">
                  <Plus className="size-3" /> Tag
                </button>
              </div>

              {/* Location Association */}
              <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-border">
                {locations.map((loc, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-semibold bg-badge-accent text-primary border-border gap-1 rounded-lg px-2.5 py-1">
                    <MapPin className="size-3 text-primary" />
                    {loc}
                  </Badge>
                ))}
                <button className="text-xs font-bold text-muted-foreground0 hover:text-foreground border border-dashed border-border rounded-lg px-2.5 py-1 hover:bg-muted flex items-center gap-1">
                  <Plus className="size-3" /> Location
                </button>
              </div>

              {/* Asset Association */}
              <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-border">
                {assets.map((asset, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-semibold bg-badge-warning text-badge-warning-foreground border-border gap-1 rounded-lg px-2.5 py-1">
                    <Box className="size-3 text-badge-warning-foreground" />
                    {asset}
                  </Badge>
                ))}
                <button className="text-xs font-bold text-muted-foreground0 hover:text-foreground border border-dashed border-border rounded-lg px-2.5 py-1 hover:bg-muted flex items-center gap-1">
                  <Plus className="size-3" /> Asset
                </button>
              </div>

              {/* User Association */}
              <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-border">
                {users.map((u, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-semibold bg-badge-success text-badge-success-foreground border-border gap-1 rounded-lg px-2.5 py-1">
                    <User className="size-3 text-badge-success-foreground" />
                    {u}
                  </Badge>
                ))}
                <button className="text-xs font-bold text-muted-foreground0 hover:text-foreground border border-dashed border-border rounded-lg px-2.5 py-1 hover:bg-muted flex items-center gap-1">
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
                className="bg-card border border-border rounded-2xl p-5  hover:border-border transition-all space-y-4 group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-text-placeholder hover:text-muted-foreground0 cursor-grab active:cursor-grabbing pt-1">
                      <GripVertical className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={task.label}
                        onChange={(e) => handleLabelChange(task.id, e.target.value)}
                        className="font-bold text-sm text-foreground border-none p-0 focus-visible:ring-0 shadow-none h-auto"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-bold bg-muted text-muted-foreground border-border rounded-md">
                      {task.taskType}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="size-7 text-text-placeholder hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Response Visual Preview */}
                {task.taskType === 'Pass/Fail' && (
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    <div className="h-9 rounded-xl bg-muted/80 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground0">
                      Pass
                    </div>
                    <div className="h-9 rounded-xl bg-muted/80 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground0">
                      Fail
                    </div>
                  </div>
                )}

                {task.taskType === 'Signature' && (
                  <div className="h-16 rounded-xl border border-dashed border-border bg-muted/50 flex items-center justify-center text-xs font-semibold text-text-placeholder">
                    Click here to sign
                  </div>
                )}

                {task.taskType === 'Text' && (
                  <div className="h-10 rounded-xl border border-border bg-muted/50 px-3 flex items-center text-xs text-text-placeholder">
                    Response text...
                  </div>
                )}

                {/* Additional Requirements Togglers */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground0">
                  <span className="font-semibold text-xs text-text-placeholder">Additional Requirements</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleReq(task.id, 'photoRequired')}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                        task.photoRequired
                          ? "bg-badge-accent border-border text-primary"
                          : "bg-muted border-border text-muted-foreground0 hover:bg-muted"
                      )}
                    >
                      <Camera className="size-3" />
                      Photo {task.photoRequired && '*'}
                    </button>

                    <button
                      onClick={() => handleToggleReq(task.id, 'noteRequired')}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                        task.noteRequired
                          ? "bg-badge-accent border-border text-primary"
                          : "bg-muted border-border text-muted-foreground0 hover:bg-muted"
                      )}
                    >
                      <FileText className="size-3" />
                      Notes {task.noteRequired && '*'}
                    </button>

                    <button
                      onClick={() => handleToggleReq(task.id, 'urlRequired')}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                        task.urlRequired
                          ? "bg-badge-accent border-border text-primary"
                          : "bg-muted border-border text-muted-foreground0 hover:bg-muted"
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
              className="w-full h-12 border-dashed border-2 border-border rounded-2xl text-muted-foreground0 font-bold text-xs hover:bg-muted hover:border-border gap-2"
            >
              <Plus className="size-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Right Action Rail (Matching Reference UI) */}
      <div className="w-72 border-l bg-card flex flex-col p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-text-placeholder">Section Builder</h3>
          <p className="text-xs text-muted-foreground0 leading-normal">Add items and response types to your inspection checklist.</p>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-text-placeholder">ADD ITEMS</span>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => handleAddTask('Pass/Fail')}
              className="w-full justify-start h-9 text-xs font-bold text-foreground rounded-xl border-border gap-2"
            >
              <Plus className="size-3.5 text-primary" />
              Add Task
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-9 text-xs font-bold text-foreground rounded-xl border-border gap-2"
            >
              <Layers className="size-3.5 text-primary" />
              Add Section
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-text-placeholder">TASK TYPES</span>
          <div className="space-y-1.5">
            {[
              { label: 'Pass/Fail', icon: <CheckSquare className="size-3.5 text-primary" />, type: 'Pass/Fail' },
              { label: 'Text', icon: <Type className="size-3.5 text-primary" />, type: 'Text' },
              { label: 'Number', icon: <Hash className="size-3.5 text-primary" />, type: 'Number' },
              { label: 'Signature', icon: <PenTool className="size-3.5 text-primary" />, type: 'Signature' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleAddTask(item.type as any)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-border hover:bg-badge-accent transition-all text-xs font-semibold text-foreground text-left group"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <Plus className="size-3.5 text-text-placeholder group-hover:text-primary" />
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
        <Badge className="bg-badge-accent text-primary border-border text-xs font-bold rounded-md px-2">
          Floor Inspection Mode
        </Badge>
        <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
        <p className="text-xs text-muted-foreground0">
          Complete the inspection items below and submit your report once verified.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-badge-error border border-destructive rounded-xl flex items-start gap-3 text-destructive animate-in fade-in duration-200">
          <AlertTriangle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold">Validation Error</h5>
            <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {submitted ? (
        <div className="bg-badge-success border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="size-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto ">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Inspection Submitted Successfully</h3>
            <p className="text-xs text-muted-foreground">
              Thank you for completing this floor safety checklist. Your responses have been recorded.
            </p>
          </div>

          {createdEvents.length > 0 && (
            <div className="mt-4 p-4 bg-card border border-border rounded-xl text-left space-y-2 ">
              <div className="flex items-center gap-2 text-badge-warning-foreground">
                <AlertTriangle className="size-4" />
                <h4 className="text-xs font-bold">Associated Safety Events Created</h4>
              </div>
              <ul className="space-y-1.5 pt-1">
                {createdEvents.map((evt, idx) => (
                  <li key={idx} className="text-xs font-medium text-foreground bg-badge-warning p-2.5 rounded-lg border border-border flex items-center justify-between">
                    <span>{evt}</span>
                    <Badge className="bg-badge-warning text-badge-warning-foreground border-border text-xs font-bold">Linked Event</Badge>
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
            className="mt-2 text-xs font-bold border-border rounded-xl"
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
                  "bg-card border rounded-2xl p-5  space-y-4 transition-all",
                  isFailed ? "border-destructive ring-1 ring-destructive bg-badge-error" : "border-border"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{task.label}</h4>
                    <Badge variant="outline" className="text-xs font-bold bg-muted text-muted-foreground0 border-border">
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
                          ? "bg-primary text-primary-foreground border-border "
                          : "bg-muted border-border text-foreground hover:bg-muted"
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
                          ? "bg-destructive text-primary-foreground border-destructive "
                          : "bg-muted border-border text-foreground hover:bg-muted"
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
                    className="h-11 rounded-xl border-border bg-muted/50 text-xs"
                  />
                )}

                {task.taskType === 'Signature' && (
                  <div 
                    onClick={() => handleTextAnswer(task.id, 'Signed by Technician')}
                    className={cn(
                      "h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-xs font-semibold cursor-pointer transition-colors",
                      answers[task.id] === 'Signed by Technician'
                        ? "border-border bg-badge-success text-badge-success-foreground"
                        : "border-border bg-muted/50 text-text-placeholder hover:bg-muted"
                    )}
                  >
                    <PenTool className="size-5 mb-1" />
                    {answers[task.id] === 'Signed by Technician' ? 'Signature Recorded ✓' : 'Tap to sign'}
                  </div>
                )}

                {/* Photo & Note Inputs / Triggers */}
                <div className="space-y-3 pt-1 border-t border-border">
                  {/* Note Input */}
                  {(task.noteRequired || isFailed) && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <FileText className="size-3.5 text-text-placeholder" />
                        {isFailed ? 'Failure Description / Justification' : 'Note / Comments'}
                        {(task.noteRequired || isFailed) && <span className="text-destructive">*</span>}
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
                        className="w-full rounded-xl border border-border bg-muted/50 p-3 text-xs focus:bg-card focus:ring-2 focus:ring-primary outline-none transition-all"
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
                            ? "bg-badge-success border-border text-badge-success-foreground"
                            : "bg-muted border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Camera className="size-3.5" />
                        {mediaAttached[task.id] ? 'Photo Attached ✓' : 'Attach Photo'}
                        {task.photoRequired && <span className="text-destructive">*</span>}
                      </button>
                    </div>

                    {task.photoRequired && !mediaAttached[task.id] && (
                      <span className="text-xs text-destructive font-semibold">* Photo required</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-primary hover:bg-primary text-primary-foreground font-bold rounded-xl text-xs "
          >
            Submit Inspection Report
          </Button>
        </div>
      )}
    </div>
  );
};
