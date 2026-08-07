"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/providers/trpc';

export default function EditAccessPointPage() {
  const router = useRouter();
  const params = useParams();
  const accessPointId = params?.id as string;

  const { data: accessPoint, isLoading } = trpc.accessPoint.getById.useQuery({ id: accessPointId }, { enabled: !!accessPointId });

  const [selectedType, setSelectedType] = useState<'event' | 'documentation' | 'both'>('both');
  const [requireId, setRequireId] = useState(true);
  const [name, setName] = useState('New York - Required ID');

  useEffect(() => {
    if (accessPoint) {
      setName(accessPoint.name || 'New York - Required ID');
      setSelectedType(accessPoint.type || 'both');
    }
  }, [accessPoint]);

  const handleSave = () => {
    toast.success('Access point updated successfully');
    router.push('/access-points');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading access point data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <Sidebar />
      <div className="flex-1 ml-[var(--spacing-sidebar)]">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <span>Safety Management</span>
            <span>›</span>
            <span className="font-semibold text-gray-900">Edit Access Point</span>
          </div>

          <div className="space-y-6">
            {/* Section 1: Access Point Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-1">
                  Access point information <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Name the access point, choose what it does when scanned, and where it lives.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              {/* Type Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Event */}
                  <div 
                    onClick={() => setSelectedType('event')}
                    className={`border rounded-xl p-4 cursor-pointer transition-all relative flex flex-col justify-between ${
                      selectedType === 'event' 
                        ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Shield className={`size-5 ${selectedType === 'event' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div className={`size-3.5 rounded-full border flex items-center justify-center ${
                        selectedType === 'event' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedType === 'event' && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-900">Event</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Scanning opens an event report.</p>
                    </div>
                  </div>

                  {/* Documentation */}
                  <div 
                    onClick={() => setSelectedType('documentation')}
                    className={`border rounded-xl p-4 cursor-pointer transition-all relative flex flex-col justify-between ${
                      selectedType === 'documentation' 
                        ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <FileText className={`size-5 ${selectedType === 'documentation' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div className={`size-3.5 rounded-full border flex items-center justify-center ${
                        selectedType === 'documentation' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedType === 'documentation' && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-900">Documentation</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Scanning surfaces documents to read.</p>
                    </div>
                  </div>

                  {/* Both */}
                  <div 
                    onClick={() => setSelectedType('both')}
                    className={`border rounded-xl p-4 cursor-pointer transition-all relative flex flex-col justify-between ${
                      selectedType === 'both' 
                        ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Layers className={`size-5 ${selectedType === 'both' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div className={`size-3.5 rounded-full border flex items-center justify-center ${
                        selectedType === 'both' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedType === 'both' && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-900">Both</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Scanning offers event reporting and documents.</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Choose what happens when someone scans this access point.</p>
              </div>

              {/* Require Reporter Identification Toggle */}
              <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Require reporter identification</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">When enabled, people reporting events must provide their name and email.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setRequireId(!requireId)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    requireId ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    requireId ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Location & Asset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select defaultValue="loc3" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none">
                    <option value="loc3">Toronto</option>
                    <option value="loc1">Main Site</option>
                    <option value="loc2">Portland</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Asset (Optional)</label>
                  <select className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none">
                    <option value="">Select an asset</option>
                    <option value="a1">Forklift #4</option>
                    <option value="a2">Boiler Room Transformer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Event Form Templates */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Event form templates</h2>
                <p className="text-xs text-gray-500 mt-1">Pick which forms appear to anyone who reports an event from this access point.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Event Form Templates</label>
                <select className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-white focus:outline-none">
                  <option value="">Select templates...</option>
                  <option value="t1">Standard Incident Report</option>
                  <option value="t2">Near Miss Observation</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Choose up to 5 templates (5 remaining)</p>
              </div>
            </div>

            {/* Section 3: Notifications */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Notifications</h2>
                <p className="text-xs text-gray-500 mt-1">Notify specific people whenever this access point is used.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Team Members to Notify (Optional)</label>
                <select className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-white focus:outline-none">
                  <option value="">Select team members to notify</option>
                  <option value="u1">Alice Johnson (Safety Manager)</option>
                  <option value="u2">Bob Smith (Operations Lead)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  These team members are notified when an event is reported or attached documents are accessed, based on the access point&apos;s type.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-12">
              <Button 
                variant="outline" 
                onClick={() => router.push('/access-points')}
                className="h-10 px-6 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
