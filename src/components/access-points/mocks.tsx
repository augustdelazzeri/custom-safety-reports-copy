import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Download, 
  SlidersHorizontal, 
  Calendar as CalendarIcon, 
  QrCode, 
  FileText, 
  Layers, 
  Shield 
} from 'lucide-react';

export const Filters = () => (
  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
    <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1">Status</span>
      <span className="font-semibold">All</span>
    </div>
    <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1">Type</span>
      <span className="font-semibold">All</span>
    </div>
    <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1">Location</span>
      <span className="font-semibold">All</span>
    </div>
    <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1">Created By</span>
      <span className="font-semibold">All</span>
    </div>
    <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50">
      <span className="text-gray-500 mr-1">Form Template</span>
      <span className="font-semibold">All</span>
    </div>
    <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50 gap-1.5">
      <CalendarIcon className="size-3.5 text-gray-400" />
      <span>Created Date</span>
    </div>
    <div className="flex items-center gap-1.5 px-2 py-1.5 text-gray-600 font-medium cursor-pointer">
      <input type="checkbox" id="includeArchived" className="rounded text-blue-600" />
      <label htmlFor="includeArchived" className="cursor-pointer">Include Archived</label>
    </div>
    <div className="ml-auto flex items-center border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50 gap-1.5">
      <SlidersHorizontal className="size-3.5 text-gray-400" />
      <span>Columns</span>
    </div>
  </div>
);

export const AccessPointsTable = ({ accessPoints, onViewQRCode }: any) => (
  <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Access Point Name ↑↓</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Type</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Location</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Created Date ↓</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Status ↑↓</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessPoints.map((ap: any) => {
            const typeLabel = ap.type === 'both' ? 'Both' : ap.type === 'documentation' ? 'Documentation' : 'Event';
            const typeClass = ap.type === 'both' 
              ? 'bg-blue-600 text-white font-medium' 
              : ap.type === 'documentation' 
              ? 'bg-purple-100 text-purple-700 border-purple-200' 
              : 'bg-gray-100 text-gray-700 border-gray-200';
            
            return (
              <TableRow key={ap.id} className="hover:bg-gray-50/80">
                <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                  <Link href={`/access-points/${ap.id}`} className="hover:underline hover:text-blue-600">
                    {ap.name}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge className={`text-[11px] px-2 py-0.5 rounded ${typeClass}`} variant="secondary">
                    {typeLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                  {ap.location?.name ? `@ ${ap.location.name}` : '@ Toronto'}
                </TableCell>
                <TableCell className="text-gray-600 text-sm whitespace-nowrap">{ap.createdAt || 'Jun 22, 2026'}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium" variant="outline">
                    {ap.status === 'inactive' ? 'Inactive' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewQRCode(ap)}>
                        <QrCode className="size-4 mr-2" />
                        View QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/access-points/${ap.id}/edit`}>
                          Edit Access Point
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/access-points/${ap.id}`} target="_blank">
                          <ExternalLink className="size-4 mr-2" />
                          Open Public Scan
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  </div>
);

export const QrViewingModal = ({ isOpen, onClose, accessPoint }: any) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-bold text-gray-900 pr-6">
            {accessPoint?.name || 'Zone 3 - South Pillar Safety Station'} QR Code
          </h2>
          <p className="text-xs text-gray-500">Scan this QR code to report or access documents.</p>

          <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl inline-block shadow-sm">
            <div className="size-52 bg-gray-900 rounded-lg p-2 flex items-center justify-center relative">
              {/* Simulated QR code graphics */}
              <div className="size-full bg-white rounded p-3 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="size-10 bg-black rounded-sm border-4 border-black relative"><div className="size-4 bg-white m-auto absolute inset-0"><div className="size-2 bg-black m-auto absolute inset-0"></div></div></div>
                  <div className="size-10 bg-black rounded-sm border-4 border-black relative"><div className="size-4 bg-white m-auto absolute inset-0"><div className="size-2 bg-black m-auto absolute inset-0"></div></div></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="size-10 bg-black rounded-sm border-4 border-black relative"><div className="size-4 bg-white m-auto absolute inset-0"><div className="size-2 bg-black m-auto absolute inset-0"></div></div></div>
                  <div className="size-8 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ⚙
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            Location: <span className="text-gray-800">{accessPoint?.location?.name || 'Portland'}</span>
          </p>

          <div>
            <Link 
              href={`/access-points/${accessPoint?.id || 'ap1'}`} 
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline border border-blue-200 px-3 py-1.5 rounded-lg bg-blue-50/50"
            >
              <ExternalLink className="size-3.5" />
              View Public Link
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-normal">
            This QR code has been saved to your access points list and will remain after refresh.
          </p>

          <div className="space-y-2 pt-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 rounded-xl">
              <Download className="size-4 mr-2" />
              Download PDF
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-xs rounded-xl border-gray-200">
                Customize
              </Button>
              <Button variant="ghost" className="flex-1 h-9 text-xs rounded-xl text-gray-600 hover:bg-gray-100">
                Download QR Image
              </Button>
            </div>
            <Button variant="ghost" onClick={onClose} className="w-full h-8 text-xs text-gray-400 hover:text-gray-600">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const MobileFilters = () => null;
export const AccessPointsLoading = () => <div className="py-12 text-center text-sm text-gray-500">Loading access points...</div>;
export const AccessPointsError = () => <div className="py-12 text-center text-sm text-red-500">Failed to load access points.</div>;
export const AccessPointsEmpty = () => <div className="py-12 text-center text-sm text-gray-500">No Access Points found.</div>;
export const AccessPointBulkImport = () => null;
export const BulkImportSummaryModal = () => null;
export const AccessPointBulkActionsDropdown = ({ onImportClick }: any) => (
  <Button variant="outline" onClick={onImportClick} className="h-10 border-gray-200 text-gray-700 font-medium">
    Import
  </Button>
);
export const AccessPointsMobileView = () => null;
export const CreateAccessPointModal = ({ isModalOpen, setIsModalOpen, handleGenerateQR }: any) => null;
export const EditAccessPointNameModal = ({ isOpen, onClose, accessPoint }: any) => null;
