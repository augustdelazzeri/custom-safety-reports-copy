"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  FileDown, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  Trash2, 
  ChevronRight,
  Settings as SettingsIcon,
  Layout
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';
import { SettingsTabs } from '@/components/settings/settings-tabs';
import { deleteInspectionTemplate } from '@/lib/inspectionStore';
import { toast } from 'sonner';

export default function SafetyTemplatesList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: templates, isLoading } = trpc.eventFormTemplate.list.useQuery();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-white md:ml-64">
        <Header title="Settings" />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">
              <span>Settings</span>
              <ChevronRight className="size-3" />
              <span className="text-gray-900">Event Form Templates</span>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-xs font-medium text-gray-500">Manage your safety platform configuration.</p>
            </div>

            <SettingsTabs />

            <div className="mt-8 space-y-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-gray-900">Safety Templates</h2>
                <p className="text-xs text-gray-500">Create and manage custom form templates for events</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-xs font-bold gap-2">
                    <Layout className="size-3.5" />
                    Include Archived
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 text-xs font-bold gap-2">
                    <Layout className="size-3.5" />
                    Columns
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search templates..." 
                      className="pl-9 h-9 rounded-lg border-gray-200 bg-gray-50/50 text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-gray-200">
                    <FileDown className="size-4 text-gray-500" />
                  </Button>
                  <Button 
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm gap-2"
                    onClick={() => router.push('/settings/safety-templates/new')}
                  >
                    <Plus className="size-3.5" />
                    Create Template
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Name ↑↓</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Fields</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Conditions</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Created By</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Created Date ↑↓</TableHead>
                      <TableHead className="w-10 h-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-gray-500 font-medium">Loading templates...</TableCell>
                      </TableRow>
                    ) : templates?.map((template: any) => (
                      <TableRow key={template.id} className="hover:bg-gray-50/50 group cursor-pointer" onClick={() => router.push(`/settings/safety-templates/${template.id}`)}>
                        <TableCell className="py-3 font-bold text-gray-900 text-xs">
                          <div className="flex items-center gap-2">
                            <span>{template.name}</span>
                            {template.type === 'inspection' && (
                              <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-bold px-1.5 py-0 h-4 rounded-md">
                                Inspection
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Layout className="size-3 text-gray-400" />
                            {template.type === 'inspection' ? `${template.tasks?.length || template.fieldsCount} tasks` : template.fieldsCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">
                          <div className="flex items-center gap-1.5">
                            <SettingsIcon className="size-3 text-gray-400 rotate-90" />
                            {template.type === 'inspection' ? '-' : template.conditionsCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs font-medium">{template.createdBy}</TableCell>
                        <TableCell className="text-gray-500 text-xs font-medium">{template.createdAt}</TableCell>
                        <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
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
                                <Copy className="size-3.5 text-gray-400" /> Duplicate
                              </DropdownMenuItem>
                              <div className="h-px bg-gray-100 my-1 mx-1" />
                              <DropdownMenuItem 
                                className="rounded-lg gap-2 text-xs font-semibold py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (template.type === 'inspection') {
                                    deleteInspectionTemplate(template.id);
                                    toast.success('Inspection template deleted');
                                    window.location.reload();
                                  } else {
                                    toast.success('Template archived/deleted');
                                  }
                                }}
                              >
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
          </div>
        </main>
      </div>
    </div>
  );
}
