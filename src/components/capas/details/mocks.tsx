import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock, MapPin, User, FileText } from "lucide-react";

export const CapaHeader = ({ capa }: any) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      <CheckCircle2 className="size-4 text-emerald-600" />
      <span>CAPA Log</span>
      <span>/</span>
      <span>{capa.id}</span>
    </div>
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{capa.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">{capa.type}</Badge>
          <Badge variant="outline" className={capa.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50'}>{capa.priority}</Badge>
          <span className="text-sm text-muted-foreground">Created on {capa.createdAt}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Edit</Button>
        <Button size="sm">Complete</Button>
      </div>
    </div>
  </div>
);

export const RootCauseBadge = ({ cause }: { cause: string }) => (
  <Badge variant="secondary" className="bg-slate-100 text-slate-700">{cause}</Badge>
);

export const EffectivenessBadge = ({ effectiveness }: { effectiveness: string }) => (
  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">{effectiveness}</Badge>
);

export const OwnerSection = ({ owner, dueDate }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-sm font-medium">Ownership</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <User className="size-4 text-muted-foreground" />
        <span className="font-medium">{owner?.fullName || 'John Doe'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-red-600">
        <Clock className="size-4" />
        <span className="font-semibold">Due {dueDate}</span>
      </div>
    </CardContent>
  </Card>
);

export const LinkedTo = ({ capa, workOrders }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-sm font-medium">Linked Entities</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {capa.eventId && (
        <div className="flex items-start gap-2 text-sm">
          <FileText className="size-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Safety Event</p>
            <p className="text-xs text-muted-foreground">{capa.eventSlug}</p>
          </div>
        </div>
      )}
      {workOrders?.length > 0 ? (
        <div className="flex items-start gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Work Orders</p>
            <p className="text-xs text-muted-foreground">{workOrders.length} linked orders</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No work orders linked.</p>
      )}
    </CardContent>
  </Card>
);

export const CapaLoading = () => <div className="p-8 text-center">Loading CAPA details...</div>;
export const CapaError = () => <div className="p-8 text-center text-destructive">Error loading CAPA.</div>;
export const CapaLinkedComplianceTasks = () => null;
export const TagsSection = () => null;
