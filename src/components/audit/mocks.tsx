import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Download, 
  FileText,
  SlidersHorizontal, 
  Calendar as CalendarIcon,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  Edit2,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';

export const Filters = () => (
  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
    <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1.5 font-semibold">Status</span>
      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">All</span>
      <SlidersHorizontal className="size-3 text-gray-400" />
    </div>
    <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1.5 font-semibold">Owner</span>
      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">All</span>
      <SlidersHorizontal className="size-3 text-gray-400" />
    </div>
    <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1.5 font-semibold text-nowrap">Next Review Date</span>
      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">All</span>
      <SlidersHorizontal className="size-3 text-gray-400" />
    </div>
    <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1.5 font-semibold">Location</span>
      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">All</span>
      <SlidersHorizontal className="size-3 text-gray-400" />
    </div>
    <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50 gap-1.5">
      <CalendarIcon className="size-3.5 text-gray-400" />
      <span className="font-semibold">Last Modified Date</span>
    </div>
    <div className="flex items-center gap-1.5 px-2 py-1.5 text-gray-600 font-semibold cursor-pointer">
      <div className="size-4 border border-gray-300 rounded flex items-center justify-center bg-white">
        <SlidersHorizontal className="size-2 text-gray-400" />
      </div>
      <label className="cursor-pointer">Include Archived</label>
    </div>
    <div className="ml-auto flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-semibold cursor-pointer hover:bg-gray-50 gap-1.5">
      <SlidersHorizontal className="size-3.5 text-gray-400" />
      <span>Columns</span>
    </div>
  </div>
);

export const AuditTable = ({ audits }: any) => (
  <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Audit ↑↓</TableHead>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Reference ID ↑↓</TableHead>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Owner ↑↓</TableHead>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Type</TableHead>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Status ↑↓</TableHead>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Location ↑↓</TableHead>
            <TableHead className="font-bold text-gray-700 h-10 text-xs uppercase tracking-wider whitespace-nowrap">Asset</TableHead>
            <TableHead className="w-10 h-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audits.map((audit: any) => (
            <TableRow key={audit.id} className="hover:bg-gray-50/50 group">
              <TableCell className="py-3 whitespace-nowrap">
                <Link href={`/audits/${audit.id}`} className="flex flex-col">
                  <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{audit.slug}</span>
                  <span className="text-[11px] text-gray-500 font-medium">{audit.title}</span>
                </Link>
              </TableCell>
              <TableCell className="text-gray-500 text-sm font-medium whitespace-nowrap">{audit.referenceId || '-'}</TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <div className="size-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">
                    {audit.ownerName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{audit.ownerName}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 text-sm font-medium whitespace-nowrap">{audit.type || 'Safety Audit'}</TableCell>
              <TableCell className="whitespace-nowrap">
                {audit.status === 'Approved/Active' ? (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">Approved/Active</span>
                  </div>
                ) : audit.status === 'Under Review' ? (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Clock className="size-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">Under Review</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="size-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">Draft</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="size-3" />
                  <span className="text-xs font-medium truncate max-w-[120px]">{audit.locationName || 'No location'}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-400 text-xs font-medium italic whitespace-nowrap">{audit.assetName || 'No asset'}</TableCell>
              <TableCell className="text-right pr-4 whitespace-nowrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-700 focus:ring-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl border-gray-100">
                    <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                      <Eye className="size-3.5 text-gray-400" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                      <CheckCircle2 className="size-3.5 text-gray-400" /> View Active Version
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                      <Edit2 className="size-3.5 text-gray-400" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                      <Copy className="size-3.5 text-gray-400" /> Duplicate
                    </DropdownMenuItem>
                    <div className="h-px bg-gray-100 my-1 mx-1" />
                    <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                      <Archive className="size-3.5 text-gray-400" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="size-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export const MobileFilters = () => null;
export const AuditLoading = () => <div className="py-20 text-center space-y-4">
  <div className="size-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
  <p className="text-sm text-gray-500 font-medium">Loading audits and inspections...</p>
</div>;
export const AuditError = () => <div className="py-20 text-center text-red-500 font-medium">Failed to load safety audits.</div>;
export const AuditEmpty = ({ onResetFilters }: any) => (
  <div className="py-24 text-center space-y-4 border-2 border-dashed border-gray-100 rounded-2xl bg-white/50">
    <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
      <FileText className="size-8 text-gray-200" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-gray-900">No audits found</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">Try adjusting your filters or create a new safety audit.</p>
    </div>
    <Button onClick={onResetFilters} variant="outline" className="rounded-xl font-semibold">Clear all filters</Button>
  </div>
);
export const AuditMobileView = ({ audits }: any) => (
  <div className="grid gap-3">
    {audits.map((audit: any) => (
      <Link key={audit.id} href={`/audits/${audit.id}`}>
        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <h4 className="font-bold text-gray-900 text-sm">{audit.slug}</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{audit.title}</p>
            </div>
            <Badge className={audit.status === 'Approved/Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}>
              {audit.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>{audit.ownerName}</span>
            <span>{audit.auditDate}</span>
          </div>
        </div>
      </Link>
    ))}
  </div>
);
