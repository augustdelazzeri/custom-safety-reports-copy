import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const NewEventBasicForm = () => (
  <div className="container mx-auto max-w-2xl py-8">
    <Card>
      <CardHeader>
        <CardTitle>Report Safety Event</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Title</label>
          <Input placeholder="e.g. Slip and fall near entrance" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea placeholder="Provide more details about the event..." rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Input placeholder="Incident, Near Miss, etc." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <Input placeholder="Low, Medium, High" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Submit Report</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const NewEventTemplateForm = ({ templateId }: { templateId: string }) => (
  <div className="container mx-auto max-w-2xl py-8">
    <Card>
      <CardHeader>
        <CardTitle>Report Event (Template: {templateId})</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">This form is pre-configured by the template.</p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Submit Report</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
