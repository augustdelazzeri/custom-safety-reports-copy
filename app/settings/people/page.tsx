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
  UserPlus,
  Mail,
  ChevronRight,
  Filter,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsTabs } from '@/components/settings/settings-tabs';
import { cn } from '@/lib/utils';

export default function PeopleAndPermissions() {
  const [search, setSearch] = useState('');
  
  const users = [
    { id: '1', name: 'August Delazzeri', email: 'august@upkeep.com', role: 'Global Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: '2', name: 'Amanda Santos', email: 'amanda@upkeep.com', role: 'Safety Manager', status: 'Active', lastLogin: '1 day ago' },
    { id: '3', name: 'John Doe', email: 'john@upkeep.com', role: 'Technician', status: 'Inactive', lastLogin: '3 months ago' },
  ];

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
              <span className="text-gray-900">People & Permissions</span>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-xs font-medium text-gray-500">Manage your safety platform configuration.</p>
            </div>

            <SettingsTabs />

            <div className="mt-8 space-y-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-gray-900">People & Permissions</h2>
                <p className="text-xs text-gray-500">Manage users and their access roles across the platform</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-xs font-bold gap-2">
                    <Filter className="size-3.5" />
                    Role: All
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 text-xs font-bold gap-2">
                    <Filter className="size-3.5" />
                    Status: Active
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search people..." 
                      className="pl-9 h-9 rounded-lg border-gray-200 bg-gray-50/50 text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-gray-200">
                    <FileDown className="size-4 text-gray-500" />
                  </Button>
                  <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm gap-2">
                    <UserPlus className="size-3.5" />
                    Invite User
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">User ↑↓</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Role</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 h-10 text-[10px] uppercase tracking-wider">Last Login</TableHead>
                      <TableHead className="w-10 h-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 group">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-xs">{user.name}</span>
                              <span className="text-[10px] text-gray-500 font-medium">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold text-gray-600 bg-gray-50 border-gray-200">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={cn("size-1.5 rounded-full", user.status === 'Active' ? "bg-emerald-500" : "bg-gray-300")} />
                            <span className="text-xs font-medium text-gray-700">{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs font-medium">{user.lastLogin}</TableCell>
                        <TableCell className="text-right pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-700">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl border-gray-100">
                              <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                                <Mail className="size-3.5 text-gray-400" /> Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2">
                                <Plus className="size-3.5 text-gray-400" /> Edit Role
                              </DropdownMenuItem>
                              <div className="h-px bg-gray-100 my-1 mx-1" />
                              <DropdownMenuItem className="rounded-lg gap-2 text-xs font-semibold py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash2 className="size-3.5" /> Deactivate
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
