import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  UploadCloud, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  ArrowUp 
} from 'lucide-react';

export const PublicScanHeader = ({ accessPoint }: any) => null;

export const DocumentsOverview = ({ accessPoint }: any) => {
  const docs = accessPoint?.documents || {};
  const sdsList = docs.sds || [
    { title: 'ACID #8 1K ACID ETCH PRIMER BLACK AEROSOL', sub: 'U-POL US inc' },
    { title: 'ACID #8 1K ACID ETCH PRIMER GRAY AEROSOL', sub: 'U-POL US inc' },
    { title: 'S 0510-R90B BLUE POLYESTER', sub: 'PPG Industries, Inc.' },
  ];
  const lotoList = docs.loto || [
    { title: 'LOTO: Conveyor Belt Maintenance' },
    { title: 'LOTO: LOTO-CVS-304: Isolation of Conveyor 3' },
    { title: 'LOTO: LOTO-CVS-304: Isolation of Conveyor 3' },
    { title: 'LOTO: Conveyor Belt Maintenance – LOTO Procedure' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-2">
      {/* Title & Location Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">{accessPoint?.name || 'Zone 3 - South Pillar Safety Station'}</h1>
          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] font-semibold px-1.5 py-0">
            {accessPoint?.type === 'both' ? 'Both' : 'Documentation'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <MapPin className="size-3 text-gray-400" />
          {accessPoint?.location?.name || 'Portland'}
        </p>
      </div>

      {/* SDS Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          SDS ({sdsList.length})
        </h3>
        <div className="space-y-2">
          {sdsList.map((item: any, idx: number) => (
            <div 
              key={idx} 
              className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between hover:border-gray-300 shadow-2xs transition-all cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-semibold text-gray-900">{item.product || item.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.manufacturer || item.sub || 'Chemical Safety Document'}</p>
              </div>
              <ChevronRight className="size-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* LOTO Section */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          LOTO ({lotoList.length})
        </h3>
        <div className="space-y-2">
          {lotoList.map((item: any, idx: number) => (
            <div 
              key={idx} 
              className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between hover:border-gray-300 shadow-2xs transition-all cursor-pointer"
            >
              <h4 className="text-xs font-semibold text-gray-900">{item.title}</h4>
              <ChevronRight className="size-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CaptureEventTab = ({ accessPoint }: any) => {
  const [manualForm, setManualForm] = useState(false);
  const [description, setDescription] = useState('');

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Report an Event</h1>
        <p className="text-xs text-gray-500">Tell us what&apos;s happening and we&apos;ll guide you through the rest</p>
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
            <MapPin className="size-3 text-gray-400" />
            {accessPoint?.name || 'Zone 3 - South Pillar Safety Station'}
          </span>
        </div>
      </div>

      {/* Voice / AI Description Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900">
            Describe your event <span className="text-red-500">*</span>
          </label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setManualForm(!manualForm)}
            className="h-7 text-xs border-gray-200 text-blue-600 font-medium hover:bg-blue-50"
          >
            {manualForm ? 'Use AI voice assistant' : 'Fill out form manually'}
          </Button>
        </div>

        <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3 relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent"
            placeholder="Type or speak your description.."
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Mic className="size-4" />
            </button>
            <button className="size-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200">
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 leading-normal">
          Press Enter to submit, Shift+Enter for a new line<br />
          What happened? Where? When? Who was involved?
        </p>
      </div>

      {/* Upload Photos or Videos */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-gray-900">Upload Photos or Videos (optional)</h4>
        <p className="text-[11px] text-gray-500">Upload supporting media or documentation to help clarify what happened.</p>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors space-y-2">
          <div className="size-10 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto shadow-2xs text-gray-500">
            <UploadCloud className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Tap to take a photo or upload</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Up to 10 files - Max File Size: 20MB</p>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="space-y-4 pt-2">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EVENT DETAILS</h4>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Briefly describe what happened"
          />
          <p className="text-[11px] text-gray-400">A short description of the event (e.g., &quot;Fall from ladder in warehouse&quot;)</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">
            Time of Event <span className="text-red-500">*</span>
          </label>
          <input 
            type="datetime-local" 
            className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-700 bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm">
          Submit Report
        </Button>
      </div>
    </div>
  );
};

export const BothTabs = ({ accessPoint }: any) => {
  const [activeTab, setActiveTab] = useState<'capture' | 'documents'>('capture');

  return (
    <div className="w-full">
      {/* Top Pill Tab Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200/80">
          <button
            onClick={() => setActiveTab('capture')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'capture'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Capture Event
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'documents'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            View Documents
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'capture' ? (
        <CaptureEventTab accessPoint={accessPoint} />
      ) : (
        <DocumentsOverview accessPoint={accessPoint} />
      )}
    </div>
  );
};

export const PublicScanNotAvailable = () => (
  <div className="text-center py-20 space-y-3">
    <div className="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
      !
    </div>
    <h1 className="text-xl font-bold text-gray-900">Access Point Not Available</h1>
    <p className="text-xs text-gray-500 max-w-sm mx-auto">
      This link might be invalid, expired, or archived.
    </p>
  </div>
);
