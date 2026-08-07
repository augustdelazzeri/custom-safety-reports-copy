import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MapPin, User, FileText, AlertTriangle } from "lucide-react";

export const EventHeader = ({ event }: any) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      <AlertTriangle className="size-4" />
      <span>Safety Events</span>
      <span>/</span>
      <span>{event.id}</span>
    </div>
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">{event.type}</Badge>
          <Badge variant="outline" className={event.severity === 'high' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50'}>{event.severity}</Badge>
          <span className="text-sm text-muted-foreground">Reported on {event.reportedAt}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Edit</Button>
        <Button size="sm">Share</Button>
      </div>
    </div>
  </div>
);

export const Insight = ({ event }: any) => (
  <Card className="bg-blue-50 border-blue-100">
    <CardContent className="py-4">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">Safety Insight</p>
          <p className="text-sm text-blue-800 mt-1">This event is similar to 3 other incidents in the last 6 months at this location. Consider reviewing the floor safety protocols.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const LinkedCapas = ({ eventId }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-base">Linked CAPAs</CardTitle></CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">No corrective actions linked to this event yet.</p>
      <Button variant="outline" size="sm" className="mt-4 w-full">Create CAPA</Button>
    </CardContent>
  </Card>
);

export const DetailSidebar = ({ children }: any) => (
  <div className="space-y-6">{children}</div>
);

export const StatusSection = ({ status }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
    <CardContent>
      <Badge className="w-full justify-center py-1">{status}</Badge>
    </CardContent>
  </Card>
);

export const LocationAndAssetsSection = ({ location }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-sm font-medium">Location</CardTitle></CardHeader>
    <CardContent>
      <div className="flex items-start gap-2">
        <MapPin className="size-4 text-muted-foreground mt-0.5" />
        <span className="text-sm">{location || 'Main Site > Production'}</span>
      </div>
    </CardContent>
  </Card>
);

export const TimelineSection = () => (
  <Card>
    <CardHeader><CardTitle className="text-sm font-medium">Timeline</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Event Reported</p>
            <p className="text-[10px] text-muted-foreground">July 27, 2026 10:00 AM</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const EventDetailsLoading = () => <div className="p-8">Loading event details...</div>;
export const EventDetailsError = () => <div className="p-8 text-destructive">Error loading event.</div>;
export const CustomFieldsDisplaySection = () => null;
export const MediaGrid = () => null;
export const MediaViewerModal = () => null;
export const OshaDetails = () => null;
export const NotifiedTeamMembersSection = () => null;
export const CommentsSection = () => (
  <Card>
    <CardHeader><CardTitle className="text-base">Comments</CardTitle></CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">No comments yet.</p>
    </CardContent>
  </Card>
);
