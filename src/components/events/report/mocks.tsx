import React from 'react';
import { Button } from '@/components/ui/button';

export const NewEventReportBasicForm = ({ accessPoint }: any) => (
  <div className="p-6 border rounded-lg bg-white shadow-sm">
    <h1 className="text-2xl font-bold mb-2">Safety Report</h1>
    <p className="text-muted-foreground mb-6">Reporting from: <strong>{accessPoint?.name}</strong></p>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input type="text" className="w-full border p-2 rounded" placeholder="Enter your name" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input type="email" className="w-full border p-2 rounded" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Incident Type</label>
        <select className="w-full border p-2 rounded">
          <option>Near Miss</option>
          <option>Injury</option>
          <option>Property Damage</option>
          <option>Environmental</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea className="w-full border p-2 rounded" rows={5} placeholder="What happened?"></textarea>
      </div>
      <Button className="w-full h-12 text-lg">Submit Safety Report</Button>
    </div>
  </div>
);

export const NewEventReportTemplateForm = ({ accessPoint, eventFormTemplate }: any) => (
  <div className="p-6 border rounded-lg bg-white shadow-sm">
    <h1 className="text-2xl font-bold mb-2">{eventFormTemplate?.name}</h1>
    <p className="text-muted-foreground mb-6">Reporting from: <strong>{accessPoint?.name}</strong></p>
    <div className="space-y-4">
      <p className="text-sm italic">This form is using a custom template.</p>
      {/* Mocking template fields */}
      <div className="space-y-4 py-4 border-y border-dashed">
        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-8 bg-gray-100 rounded w-1/2"></div>
      </div>
      <Button className="w-full h-12 text-lg">Submit {eventFormTemplate?.name}</Button>
    </div>
  </div>
);
