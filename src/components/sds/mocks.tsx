import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const SdsTable = ({ sdsList }: any) => (
  <Card className="mt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Manufacturer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sdsList.map((sds: any) => (
          <TableRow key={sds.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{sds.product}</span>
                <span className="text-xs text-muted-foreground">{sds.slug}</span>
              </div>
            </TableCell>
            <TableCell>{sds.manufacturer}</TableCell>
            <TableCell><Badge variant="outline">{sds.status}</Badge></TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export const Filters = ({ resetFilters, activeFilterCount }: any) => (
  <div className="flex items-center gap-2 mt-4">
    <Button variant="outline" size="sm">Signal Word</Button>
    <Button variant="outline" size="sm">Tags</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const SdsMobileView = ({ sdsList }: any) => (
  <div className="grid gap-4 mt-6">
    {sdsList.map((sds: any) => (
      <Card key={sds.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{sds.product}</h4>
            <p className="text-xs text-muted-foreground">{sds.manufacturer}</p>
          </div>
          <Badge>{sds.status}</Badge>
        </div>
      </Card>
    ))}
  </div>
);

export const SdsLoading = () => <div className="p-8 text-center text-muted-foreground italic">Searching chemical library...</div>;
export const SdsError = () => <div className="p-8 text-center text-destructive">Error loading safety data sheets.</div>;
export const SdsEmpty = () => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6 text-muted-foreground">
    No Safety Data Sheets found matching your search.
  </div>
);

export const SdsStatusBadge = ({ status }: any) => <Badge variant="secondary">{status}</Badge>;
export const SdsSignalWordBadge = ({ signalWord }: any) => (
  <Badge className={signalWord === 'danger' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>
    {signalWord}
  </Badge>
);
export const GHSPictogramList = ({ pictograms }: any) => (
  <div className="flex gap-2">
    {pictograms.map((p: any) => <Badge key={p} variant="outline" className="capitalize">{p}</Badge>)}
  </div>
);
export const ReviewDateIndicator = ({ date }: any) => <span className="text-xs text-green-600 font-medium">Next: {new Date(date).toLocaleDateString()}</span>;
