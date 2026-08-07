import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BarChart3, Settings, Shield, MapPin, Search, FileDown, Plus, TriangleAlert, Gauge } from "lucide-react";

export const PrivacyTab = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold">Privacy Preferences</h2>
      <p className="text-sm text-muted-foreground">Manage how your data is collected and used.</p>
    </div>
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex gap-3">
            <BarChart3 className="size-5 text-primary mt-1" />
            <div>
              <CardTitle className="text-base">Analytics Data</CardTitle>
              <CardDescription>Help us improve by sharing anonymous usage data.</CardDescription>
            </div>
          </div>
          <Switch defaultChecked />
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex gap-3">
            <Settings className="size-5 text-muted-foreground mt-1" />
            <div>
              <CardTitle className="text-base">Essential Cookies</CardTitle>
              <CardDescription>Required for the app to function properly.</CardDescription>
            </div>
          </div>
          <Switch checked disabled />
        </CardHeader>
      </Card>
    </div>
    <div className="flex justify-end"><Button>Save Preferences</Button></div>
  </div>
);

export const OshaLocationsTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">OSHA Locations</h2>
        <p className="text-sm text-muted-foreground">Configure establishments for OSHA reporting.</p>
      </div>
      <Button><Plus className="size-4 mr-2" /> Create Location</Button>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search locations..." className="pl-9" />
      </div>
      <Button variant="outline" size="icon"><FileDown className="size-4" /></Button>
    </div>

    <Card className="shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Location Name</TableHead>
            <TableHead>Establishment Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            { id: 1, name: 'Main Plant', establishment: 'UpKeep Manufacturing', status: 'Active' },
            { id: 2, name: 'South Warehouse', establishment: 'UpKeep Logistics', status: 'Active' },
          ].map(loc => (
            <TableRow key={loc.id}>
              <TableCell className="font-bold text-sm">{loc.name}</TableCell>
              <TableCell className="text-sm">{loc.establishment}</TableCell>
              <TableCell><Badge variant="secondary" className="text-[10px]">Active</Badge></TableCell>
              <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

export const HazardsAndControlsTab = () => (
  <div className="space-y-6">
    <div className="flex gap-4 border-b pb-1">
      <div className="px-4 py-2 border-b-2 border-primary font-bold text-sm flex items-center gap-2">
        <TriangleAlert className="size-4" /> Hazards
      </div>
      <div className="px-4 py-2 border-b-2 border-transparent font-bold text-sm flex items-center gap-2 text-muted-foreground">
        <Gauge className="size-4" /> Control Measures
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="relative w-64">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search hazards..." className="pl-9" />
      </div>
      <Button><Plus className="size-4 mr-2" /> Add Hazard</Button>
    </div>

    <Card className="shadow-sm overflow-hidden">
      <Table>
        <TableHeader><TableRow className="bg-muted/50"><TableHead>Hazard Name</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {[
            { id: 1, name: 'Slippery Floor', cat: 'Physical' },
            { id: 2, name: 'Noise Exposure', cat: 'Environmental' },
          ].map(h => (
            <TableRow key={h.id}><TableCell className="font-bold text-sm">{h.name}</TableCell><TableCell className="text-sm">{h.cat}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);
