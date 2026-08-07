import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical, Plus } from "lucide-react";

export const FormBuilder = ({ state, onStateChange }: any) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Field Library */}
      <div className="w-64 border-r bg-muted/10 p-4 space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Field Library</h3>
        <div className="space-y-2">
          {['Text Input', 'Date Picker', 'Dropdown', 'Checkbox', 'Media Upload'].map(field => (
            <div key={field} className="p-3 bg-card border rounded shadow-sm cursor-grab hover:border-primary transition-colors flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{field}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-slate-50/30 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-lg">Event Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 border rounded-lg bg-card flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <GripVertical className="size-4 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-bold">Location</p>
                     <p className="text-[10px] text-muted-foreground uppercase">Dropdown • Required</p>
                   </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-4" /></Button>
              </div>
              <div className="p-4 border rounded-lg bg-card flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <GripVertical className="size-4 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-bold">Summary</p>
                     <p className="text-[10px] text-muted-foreground uppercase">Text Input • Required</p>
                   </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-4" /></Button>
              </div>
              <Button variant="outline" className="w-full border-dashed border-2 py-8 mt-4"><Plus className="size-4 mr-2" /> Add Field</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const ConditionalLogicBuilder = () => (
  <div className="p-8 text-center bg-slate-50/30 h-full">
    <div className="max-w-3xl mx-auto py-12 space-y-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
        <span className="text-2xl font-bold">?</span>
      </div>
      <h2 className="text-xl font-bold">No conditional rules defined</h2>
      <p className="text-muted-foreground max-w-sm mx-auto">Conditional logic allows you to show or hide fields based on other field values.</p>
      <Button><Plus className="size-4 mr-2" />Add Rule</Button>
    </div>
  </div>
);

export const EditEventFormTemplateLoading = () => <div className="p-8 text-center">Loading template editor...</div>;
export const EditEventFormTemplateError = () => <div className="p-8 text-center text-destructive">Error loading template.</div>;
