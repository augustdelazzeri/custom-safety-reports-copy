import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const WorkOrderTable = ({ workOrders }: any) => (
  <Card className="mt-6 overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Number</TableHead>
            <TableHead className="whitespace-nowrap">Description</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Priority</TableHead>
            <TableHead className="whitespace-nowrap">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo: any) => (
            <TableRow key={wo.id}>
              <TableCell className="font-medium whitespace-nowrap">{wo.workOrderNumber}</TableCell>
              <TableCell className="whitespace-nowrap">{wo.mainDescription}</TableCell>
              <TableCell className="whitespace-nowrap"><Badge variant="outline">{wo.currentStatus}</Badge></TableCell>
              <TableCell className="whitespace-nowrap">
                 <Badge className={wo.priorityNumber === 1 ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}>
                   P{wo.priorityNumber}
                 </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{new Date(wo.dueDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </Card>
);

export const WorkOrderFilters = ({ resetFilters, activeFilterCount }: any) => (
  <div className="flex items-center gap-2 mt-4">
    <Button variant="outline" size="sm">Status</Button>
    <Button variant="outline" size="sm">Priority</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const WorkOrderMobileView = ({ workOrders }: any) => (
  <div className="grid gap-4 mt-6">
    {workOrders.map((wo: any) => (
      <Card key={wo.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{wo.workOrderNumber}</h4>
            <p className="text-sm">{wo.mainDescription}</p>
          </div>
          <Badge>{wo.currentStatus}</Badge>
        </div>
      </Card>
    ))}
  </div>
);

export const WorkOrderLoading = () => <div className="p-8 text-center text-muted-foreground">Loading work orders...</div>;
export const WorkOrderError = () => <div className="p-8 text-center text-destructive">Error loading work orders.</div>;
export const WorkOrderEmpty = () => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6">
    <h3 className="text-lg font-medium">No safety work orders found</h3>
  </div>
);

export const WorkOrderMobileFilters = () => null;

export const WorkOrderAISummary = ({ analysis }: any) => (
  <Card className="bg-blue-50 border-blue-100 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-blue-800 flex items-center gap-2">
        <span>✨ AI Summary</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-blue-900 leading-relaxed italic">{analysis?.summary}</p>
    </CardContent>
  </Card>
);

export const WorkOrderStatusBadge = ({ status }: any) => (
  <Badge variant="secondary" className="capitalize">{status}</Badge>
);

export const SafetyWorkOrderDetailsLoading = () => <div className="p-8 text-center italic">Loading details...</div>;
export const SafetyWorkOrderDetailsError = () => <div className="p-8 text-center text-destructive">Error loading details.</div>;
