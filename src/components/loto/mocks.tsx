import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const LotoTable = ({ lotos }: any) => (
  <Card className="mt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lotos.map((loto: any) => (
          <TableRow key={loto.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{loto.title}</span>
                <span className="text-xs text-muted-foreground">{loto.slug}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={loto.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {loto.status}
              </Badge>
            </TableCell>
            <TableCell>{loto.ownerName}</TableCell>
            <TableCell>{loto.locationName}</TableCell>
            <TableCell>{loto.assetName}</TableCell>
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
    <Button variant="outline" size="sm">Filter by Department</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const LotoMobileView = ({ lotos }: any) => (
  <div className="grid gap-4 mt-6">
    {lotos.map((loto: any) => (
      <Card key={loto.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{loto.title}</h4>
            <p className="text-xs text-muted-foreground">{loto.slug}</p>
          </div>
          <Badge>{loto.status}</Badge>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">{loto.locationName}</span>
          <span className="text-xs font-medium">{loto.assetName}</span>
        </div>
      </Card>
    ))}
  </div>
);

export const LotoLoading = () => <div className="p-8 text-center text-muted-foreground">Loading LOTOs...</div>;
export const LotoError = () => <div className="p-8 text-center text-destructive">Error loading LOTOs.</div>;
export const LotoEmpty = ({ onResetFilters }: any) => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6">
    <h3 className="text-lg font-medium">No LOTOs found</h3>
    <Button onClick={onResetFilters} variant="outline" className="mt-4">Clear all filters</Button>
  </div>
);

export const MobileFilters = () => null;

export const GeneralInformation = ({ department, procedures }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">General Information</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase text-muted-foreground">Department</label>
        <p className="text-sm">{department}</p>
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-muted-foreground">General Procedures</label>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
          {procedures.map((p: string, i: number) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </CardContent>
  </Card>
);

export const EnergySourcesPanel = ({ energySources }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Energy Sources</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-4">
        {energySources.map((es: any) => (
          <div key={es.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold">{es.name}</h4>
              <Badge variant="outline">{es.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Point:</span> {es.isolationPoint}</div>
              <div><span className="text-muted-foreground">Method:</span> {es.isolationMethod}</div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ProceduresPanel = ({ procedures, preProcedures, postProcedures }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Procedures</CardTitle></CardHeader>
    <CardContent className="space-y-6">
      <div>
        <h5 className="font-bold text-sm mb-2 text-blue-700">Pre-Procedure</h5>
        <div className="space-y-2">
          {preProcedures.map((p: string, i: number) => <div key={i} className="text-sm p-2 bg-slate-50 rounded border">{p}</div>)}
        </div>
      </div>
      <div>
        <h5 className="font-bold text-sm mb-2 text-blue-700">Lockout Procedure</h5>
        <div className="space-y-2">
          {procedures.map((p: string, i: number) => <div key={i} className="text-sm p-2 bg-slate-50 rounded border">{p}</div>)}
        </div>
      </div>
      <div>
        <h5 className="font-bold text-sm mb-2 text-blue-700">Post-Procedure</h5>
        <div className="space-y-2">
          {postProcedures.map((p: string, i: number) => <div key={i} className="text-sm p-2 bg-slate-50 rounded border">{p}</div>)}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SafetyProtocolsPanel = () => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Safety Protocols</CardTitle></CardHeader>
    <CardContent className="p-8 text-center text-muted-foreground italic">
      Safety protocols and emergency contact information.
    </CardContent>
  </Card>
);

export const LotoPersonnelSection = ({ owner, issuer }: any) => (
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
export const LotoSteps = () => (
  <Card>
    <CardHeader><CardTitle>LOTO Steps</CardTitle></CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full border-dashed">+ Add Step</Button>
    </CardContent>
  </Card>
);
export const StepFooter = () => null;
export const Scoped = ({ children }: any) => <>{children}</>;
