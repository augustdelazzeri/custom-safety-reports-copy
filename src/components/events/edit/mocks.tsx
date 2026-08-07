import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const EditEventBasicForm = ({ eventId, event }: any) => (
  <div className="container mx-auto max-w-3xl py-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Edit Safety Event</h1>
      <p className="text-muted-foreground">ID: {eventId}</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Title</label>
          <Input defaultValue={event?.title} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea defaultValue={event?.description} rows={6} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Input defaultValue={event?.type} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <Input defaultValue={event?.severity} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Immediate Actions</label>
          <Textarea defaultValue={event?.immediateActions} rows={3} />
        </div>
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const EditEventTemplateForm = ({ eventId, event, eventFormTemplate }: any) => (
  <div className="container mx-auto max-w-3xl py-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Edit Event (Template: {eventFormTemplate.name})</h1>
      <p className="text-muted-foreground">ID: {eventId}</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Template Controlled Fields</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground italic mb-4">This event is governed by a template.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const EditEventLoading = () => <div className="p-8 text-center">Loading edit form...</div>;
export const EditEventError = () => <div className="p-8 text-center text-destructive">Error loading event for edit.</div>;
