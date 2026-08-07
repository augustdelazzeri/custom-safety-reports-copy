import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const SopTable = ({ sops }: any) => (
  <Card className="mt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sops.map((sop: any) => (
          <TableRow key={sop.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{sop.title}</span>
                <span className="text-xs text-muted-foreground">{sop.slug}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={sop.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {sop.status}
              </Badge>
            </TableCell>
            <TableCell>{sop.ownerName}</TableCell>
            <TableCell>{sop.locationName}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export const Filters = ({ toggleStatus, resetFilters, activeFilterCount }: any) => (
  <div className="flex items-center gap-2 mt-4">
    <Button variant="outline" size="sm">Filter by Status</Button>
    <Button variant="outline" size="sm">Filter by Owner</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const SopMobileView = ({ sops }: any) => (
  <div className="grid gap-4 mt-6">
    {sops.map((sop: any) => (
      <Card key={sop.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{sop.title}</h4>
            <p className="text-xs text-muted-foreground">{sop.slug}</p>
          </div>
          <Badge>{sop.status}</Badge>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">{sop.locationName}</span>
        </div>
      </Card>
    ))}
  </div>
);

export const SopLoading = () => <div className="p-8 text-center text-muted-foreground">Loading SOPs...</div>;
export const SopError = () => <div className="p-8 text-center text-destructive">Error loading SOPs.</div>;
export const SopEmpty = ({ onResetFilters }: any) => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6">
    <h3 className="text-lg font-medium">No SOPs found</h3>
    <Button onClick={onResetFilters} variant="outline" className="mt-4">Clear all filters</Button>
  </div>
);

export const MobileFilters = () => null;

export const Overview = ({ purpose, responsibilities }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Overview</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase text-muted-foreground">Purpose</label>
        <p className="text-sm mt-1">{purpose}</p>
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-muted-foreground">Responsibilities</label>
        <p className="text-sm mt-1">{responsibilities}</p>
      </div>
    </CardContent>
  </Card>
);

export const ProcedurePhases = ({ sectionGroups }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Procedure Steps</CardTitle></CardHeader>
    <CardContent className="space-y-6">
      {['pre_procedure', 'procedure', 'post_procedure'].map(phase => (
        <div key={phase}>
          <h5 className="font-bold text-sm mb-2 text-blue-700 capitalize">{phase.replace('_', ' ')}</h5>
          <div className="space-y-2">
            {sectionGroups[phase]?.map((s: any, i: number) => (
              <div key={i} className="text-sm p-3 bg-slate-50 rounded border">
                <span className="font-bold mr-2">{s.label}:</span> {s.value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export const RisksPanel = ({ sectionGroups }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Risks & Controls</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {sectionGroups.step?.map((s: any, i: number) => (
        <div key={i} className="p-3 bg-red-50 border border-red-100 rounded">
          <span className="font-bold text-red-700">{s.label}:</span> <span className="text-sm">{s.value}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

export const EmergenciesPanel = ({ sectionGroups }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Emergency Procedures</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {sectionGroups.emergency?.map((s: any, i: number) => (
        <div key={i} className="p-3 bg-orange-50 border border-orange-100 rounded text-sm font-medium">
          {s.label}: {s.value}
        </div>
      ))}
    </CardContent>
  </Card>
);

export const ReferencePanel = ({ sectionGroups }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">References</CardTitle></CardHeader>
    <CardContent className="space-y-2">
      {sectionGroups.general?.map((s: any, i: number) => (
        <div key={i} className="text-sm">• {s.label}: {s.value}</div>
      ))}
    </CardContent>
  </Card>
);

export const LinkedTo = ({ sop }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Linked Documents</CardTitle></CardHeader>
    <CardContent className="text-sm italic text-muted-foreground">
      No linked documents.
    </CardContent>
  </Card>
);

export const StepIndicator = () => null;
export const StepProgress = () => null;
export const SopSteps = () => (
  <Card>
    <CardHeader><CardTitle>SOP Steps</CardTitle></CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full border-dashed">+ Add Step</Button>
    </CardContent>
  </Card>
);
export const StepFooter = () => null;
export const Scoped = ({ children }: any) => <>{children}</>;
export const SopVersionHistory = () => null;
export const SopConfirmationDialog = () => null;
export const StepValidationAlert = () => null;
