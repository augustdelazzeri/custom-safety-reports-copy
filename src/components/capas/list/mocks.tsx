import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const CapaTable = ({ capas }: any) => (
  <div className="rounded-md border bg-card overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Title</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Priority</TableHead>
            <TableHead className="whitespace-nowrap">Owner</TableHead>
            <TableHead className="whitespace-nowrap">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capas.map((capa: any) => (
            <TableRow key={capa.id}>
              <TableCell className="font-medium whitespace-nowrap">{capa.title}</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline">{capa.status}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant={capa.priority === 'High' ? 'destructive' : 'secondary'}>
                  {capa.priority}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{capa.owner}</TableCell>
              <TableCell className="whitespace-nowrap">{capa.dueDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export const Filters = () => (
  <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-muted/20">
    <div className="text-sm font-medium self-center mr-2">Filters:</div>
    <Badge variant="outline" className="cursor-pointer">Status</Badge>
    <Badge variant="outline" className="cursor-pointer">Priority</Badge>
    <Badge variant="outline" className="cursor-pointer">Owner</Badge>
    <Badge variant="outline" className="cursor-pointer">Type</Badge>
  </div>
);

export const CapaMobileFilters = () => null;
export const CapaMobileView = () => null;
export const CapasEmpty = () => <div>No CAPAs found.</div>;
export const CapasError = () => <div>Error loading CAPAs.</div>;
export const CapasLoading = () => <div>Loading CAPAs...</div>;
