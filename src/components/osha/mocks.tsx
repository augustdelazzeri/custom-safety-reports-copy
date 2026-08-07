import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const OshaReportsTable = ({ oshaReports }: any) => (
  <Card className="mt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slug</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Days Away</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oshaReports.map((report: any) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.slug}</TableCell>
            <TableCell>{report.employeeName}</TableCell>
            <TableCell>
              <Badge variant={report.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {report.status}
              </Badge>
            </TableCell>
            <TableCell>{report.daysAway}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export const Filters = ({ resetFilters, activeFilterCount }: any) => (
  <div className="flex items-center gap-2 mt-4">
    <Button variant="outline" size="sm">Case Type</Button>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset Filters ({activeFilterCount})
      </Button>
    )}
  </div>
);

export const OshaReportsMobileView = ({ oshaReports }: any) => (
  <div className="grid gap-4 mt-6">
    {oshaReports.map((report: any) => (
      <Card key={report.id} className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{report.employeeName}</h4>
            <p className="text-xs text-muted-foreground">{report.slug}</p>
          </div>
          <Badge>{report.status}</Badge>
        </div>
      </Card>
    ))}
  </div>
);

export const OshaReportsLoading = () => <div className="p-8 text-center text-muted-foreground">Loading OSHA reports...</div>;
export const OshaReportsError = () => <div className="p-8 text-center text-destructive">Error loading OSHA reports.</div>;
export const OshaReportsEmpty = ({ onResetFilters }: any) => (
  <div className="p-12 text-center border-2 border-dashed rounded-lg mt-6">
    <h3 className="text-lg font-medium">No OSHA reports found</h3>
    <Button onClick={onResetFilters} variant="outline" className="mt-4">Clear all filters</Button>
  </div>
);

export const MobileFilters = () => null;

export const CasesSummary = ({ summary }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg font-bold">OSHA 300A Summary</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-red-50 rounded border border-red-100 text-center">
        <div className="text-2xl font-bold text-red-700">{summary?.totalDeaths}</div>
        <div className="text-xs uppercase font-bold text-red-600 mt-1">Deaths</div>
      </div>
      <div className="p-4 bg-orange-50 rounded border border-orange-100 text-center">
        <div className="text-2xl font-bold text-orange-700">{summary?.totalCasesWithDaysAway}</div>
        <div className="text-xs uppercase font-bold text-orange-600 mt-1">Days Away</div>
      </div>
      <div className="p-4 bg-blue-50 rounded border border-blue-100 text-center">
        <div className="text-2xl font-bold text-blue-700">{summary?.totalCasesWithJobTransfer}</div>
        <div className="text-xs uppercase font-bold text-blue-600 mt-1">Transfers</div>
      </div>
      <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center">
        <div className="text-2xl font-bold text-slate-700">{summary?.totalOtherRecordableCases}</div>
        <div className="text-xs uppercase font-bold text-slate-600 mt-1">Other</div>
      </div>
    </CardContent>
  </Card>
);

export const EstablishmentInformationDetails = ({ establishmentInfo }: any) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Establishment Information</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span>{establishmentInfo?.establishmentName}</span></div>
      <div className="flex justify-between"><span className="text-muted-foreground">NAICS:</span> <span>{establishmentInfo?.naicsCode}</span></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Address:</span> <span>{establishmentInfo?.address}, {establishmentInfo?.city}</span></div>
    </CardContent>
  </Card>
);

export const CompanyExecutiveCertificationDetails = () => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Executive Certification</CardTitle></CardHeader>
    <CardContent className="text-sm italic text-muted-foreground">
      Certified by: Jane Doe (CEO) on 2026-02-01
    </CardContent>
  </Card>
);

export const OshaSummaryLoading = () => <div className="p-8 text-center text-muted-foreground italic">Generating summary...</div>;
export const OshaLocationEmpty = () => <div className="p-12 text-center text-muted-foreground">Please select a location to view the OSHA summary.</div>;
export const OshaSummaryConfirmationDialog = () => null;
export const OshaSummarySuccessDialog = () => null;
export const SuccessModal = () => null;
export const OshaTypeSelect = () => null;
export const StateSelect = () => null;
export const AsyncOshaLocationFilter = ({ selected, onSelect }: any) => (
  <Button variant="outline" className="w-full lg:w-auto">Select Location</Button>
);
export const YearSelect = ({ value, onChange }: any) => (
  <Button variant="outline" className="w-full lg:w-auto">{value || 'Select Year'}</Button>
);
export const WritingAssistant = (props: any) => <textarea {...props} className="w-full min-h-[100px] border rounded p-2" />;
