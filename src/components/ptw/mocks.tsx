import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const PtwTable = ({ ptws }: any) => (
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
        {ptws.map((ptw: any) => (
          <TableRow key={ptw.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{ptw.title}</span>
                <span className="text-xs text-muted-foreground">{ptw.slug}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={ptw.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {ptw.status}
              </Badge>
            </TableCell>
            <TableCell>{ptw.ownerName}</TableCell>
            <TableCell>{ptw.locationName}</TableCell>
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
    <Button variant="outline" size="sm">Filter by Type</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const PtwMobileView = ({ ptws }: any) => (
  <div className="grid gap-4 mt-6">
    {ptws.map((ptw: any) => (
      <Card key={ptw.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{ptw.title}</h4>
            <p className="text-xs text-muted-foreground">{ptw.slug}</p>
          </div>
          <Badge>{ptw.status}</Badge>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">{ptw.locationName}</span>
        </div>
      </Card>
    ))}
  </div>
);

export const PtwLoading = () => <div className="p-8 text-center text-muted-foreground">Loading PTWs...</div>;
export const PtwError = () => <div className="p-8 text-center text-destructive">Error loading PTWs.</div>;
export const PtwEmpty = ({ onResetFilters }: any) => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6">
    <h3 className="text-lg font-medium">No PTWs found</h3>
    <Button onClick={onResetFilters} variant="outline" className="mt-4">Clear all filters</Button>
  </div>
);

export const MobileFilters = () => null;

export const GeneralInformationPanel = ({ type, startDate, endDate, scope, emergencyContact }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">General Information</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div><label className="text-xs font-bold uppercase text-muted-foreground">Permit Type</label><p className="text-sm">{type}</p></div>
        <div><label className="text-xs font-bold uppercase text-muted-foreground">Period</label><p className="text-sm">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p></div>
        <div><label className="text-xs font-bold uppercase text-muted-foreground">Emergency Contact</label><p className="text-sm">{emergencyContact}</p></div>
      </div>
      <div><label className="text-xs font-bold uppercase text-muted-foreground">Work Scope</label><p className="text-sm">{scope}</p></div>
    </CardContent>
  </Card>
);

export const HazardsAndControlsPanel = () => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Hazards & Controls</CardTitle></CardHeader>
    <CardContent className="p-8 text-center text-muted-foreground italic">Hazard assessment and control measures.</CardContent>
  </Card>
);

export const PtwChecklistPanel = () => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Compliance Checklist</CardTitle></CardHeader>
    <CardContent className="p-8 text-center text-muted-foreground italic">Safety checklist items.</CardContent>
  </Card>
);

export const PtwPersonnelSection = ({ owner, issuer }: any) => (
  <div className="space-y-4">
    <div>
      <label className="text-xs font-bold uppercase text-muted-foreground">Owner</label>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{owner?.fullName?.split(' ').map((n:any)=>n[0]).join('')}</div>
        <span className="text-sm">{owner?.fullName}</span>
      </div>
    </div>
    <div>
      <label className="text-xs font-bold uppercase text-muted-foreground">Issuer</label>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{issuer?.fullName?.split(' ').map((n:any)=>n[0]).join('')}</div>
        <span className="text-sm">{issuer?.fullName}</span>
      </div>
    </div>
  </div>
);

export const StepIndicator = () => null;
export const StepProgress = () => null;
export const PtwSteps = () => (
  <Card>
    <CardHeader><CardTitle>Permit Steps</CardTitle></CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full border-dashed">+ Add Section</Button>
    </CardContent>
  </Card>
);
export const StepFooter = () => null;
export const Scoped = ({ children }: any) => <>{children}</>;
export const PtwVersionHistory = () => null;
export const PtwConfirmationDialog = () => null;
