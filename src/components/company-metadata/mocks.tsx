import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const OrganizationTab = ({ companyMetadata }: any) => (
  <Card>
    <CardHeader><CardTitle>Organization Settings</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-2">
        <Label>Company Name</Label>
        <Input defaultValue={companyMetadata?.name} />
      </div>
      <div className="grid gap-2">
        <Label>Industry</Label>
        <Input defaultValue={companyMetadata?.industry} />
      </div>
      <Button className="bg-primary">Save Changes</Button>
    </CardContent>
  </Card>
);

export const RegulatoryFrameworksTab = () => (
  <Card>
    <CardHeader><CardTitle>Regulatory Frameworks</CardTitle></CardHeader>
    <CardContent className="space-y-4">
       <p className="text-sm text-muted-foreground">Manage your compliance frameworks like OSHA, ISO 45001, etc.</p>
       <div className="flex gap-2">
         <Button variant="outline">OSHA 1910</Button>
         <Button variant="outline">ISO 45001</Button>
       </div>
    </CardContent>
  </Card>
);

export const CustomAiInstructionsTab = () => (
  <Card>
    <CardHeader><CardTitle>AI Behavior Settings</CardTitle></CardHeader>
    <CardContent className="space-y-4">
       <p className="text-sm text-muted-foreground">Customize how the AI assistant generates safety documents.</p>
       <textarea className="w-full min-h-[100px] border rounded p-2 text-sm" placeholder="e.g. Always emphasize fall protection..." />
       <Button className="bg-primary">Update AI Instructions</Button>
    </CardContent>
  </Card>
);
