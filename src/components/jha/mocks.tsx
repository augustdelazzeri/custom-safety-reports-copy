import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const JhaTable = ({ jhas }: any) => (
  <Card className="mt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Steps</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jhas.map((jha: any) => (
          <TableRow key={jha.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{jha.title}</span>
                <span className="text-xs text-muted-foreground">{jha.slug}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={jha.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {jha.status}
              </Badge>
            </TableCell>
            <TableCell>{jha.ownerName}</TableCell>
            <TableCell>
              <JhaRiskLevelBadge score={jha.highestResidualRiskScore} />
            </TableCell>
            <TableCell>{jha.stepCount}</TableCell>
            <TableCell>{jha.locationName}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export const JhaRiskLevelBadge = ({ score }: { score: number }) => {
  const getRisk = (s: number) => {
    if (s <= 4) return { label: 'Low', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    if (s <= 9) return { label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { label: 'High', class: 'bg-red-50 text-red-700 border-red-100' };
  };
  const risk = getRisk(score);
  return <Badge className={risk.class}>{risk.label} ({score})</Badge>;
};

export const Filters = ({ activeFilterCount, resetFilters }: any) => (
  <div className="flex items-center gap-2 mt-4">
    <Button variant="outline" size="sm">Filter by Status</Button>
    <Button variant="outline" size="sm">Filter by Risk</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const JhaMobileView = ({ jhas }: any) => (
  <div className="grid gap-4 mt-6">
    {jhas.map((jha: any) => (
      <Card key={jha.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{jha.title}</h4>
            <p className="text-xs text-muted-foreground">{jha.slug}</p>
          </div>
          <Badge>{jha.status}</Badge>
        </div>
        <div className="flex justify-between items-center mt-4">
          <JhaRiskLevelBadge score={jha.highestResidualRiskScore} />
          <span className="text-xs text-muted-foreground">{jha.stepCount} steps</span>
        </div>
      </Card>
    ))}
  </div>
);

export const JhaLoading = () => <div className="p-8 text-center text-muted-foreground">Loading JHAs...</div>;
export const JhaError = () => <div className="p-8 text-center text-destructive">Error loading JHAs.</div>;
export const JhaEmpty = ({ onResetFilters }: any) => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6">
    <h3 className="text-lg font-medium">No JHAs found</h3>
    <Button onClick={onResetFilters} variant="outline" className="mt-4">Clear all filters</Button>
  </div>
);

export const HazardAndControlMeasuresIntroModal = () => null;
export const MobileFilters = () => null;

export const JhaSteps = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Task Steps</CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full border-dashed">+ Add Step</Button>
    </CardContent>
  </Card>
);
