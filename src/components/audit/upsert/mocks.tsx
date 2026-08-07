import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const CustomFieldsSection = () => (
  <div className="mt-8 space-y-4">
    <h4 className="font-medium text-gray-900">Custom Fields</h4>
    <p className="text-sm text-gray-600">Add custom data fields to this audit.</p>
    <Button variant="outline" size="sm" type="button">+ Add Field</Button>
  </div>
);

export const LinkedDocumentsSection = () => (
  <div className="mt-4 space-y-4">
    <p className="text-sm text-gray-600">Link other safety documents to this audit.</p>
    <Button variant="outline" size="sm" type="button">+ Link Document</Button>
  </div>
);

export const AsyncLocationSelect = ({ placeholder, ...props }: any) => (
  <Input placeholder={placeholder || "Select location..."} {...props} />
);

export const AsyncAssetSelect = ({ placeholder, ...props }: any) => (
  <Input placeholder={placeholder || "Select asset..."} {...props} />
);

export const AsyncUserSelect = ({ placeholder, ...props }: any) => (
  <Input placeholder={placeholder || "Select user..."} {...props} />
);

export const MediaUploadCollapsible = ({ isOpen }: any) => isOpen ? (
  <div className="p-4 border rounded bg-gray-50 mt-2">
    <p className="text-sm text-gray-600">Media upload component placeholder</p>
  </div>
) : null;

export const ApproversSelector = ({ title, description }: any) => (
  <div className="p-6 space-y-4">
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
    <div className="flex items-center gap-2 p-2 border rounded">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">JD</div>
      <span className="text-sm">John Doe (You)</span>
      <Badge className="ml-auto">Owner</Badge>
    </div>
    <Button variant="outline" size="sm" type="button">+ Add Approver</Button>
  </div>
);

const Badge = ({ children, className }: any) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 ${className}`}>{children}</span>
);
