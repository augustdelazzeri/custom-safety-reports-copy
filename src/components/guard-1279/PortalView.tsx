"use client";

import React, { useState } from "react";
import { useGuard1275 } from "@/src/contexts/Guard1275Context";
import { MapPin, Mic, Calendar, ChevronDown, X, FileText, Download, Eye, Check } from "lucide-react";

export function PortalView() {
  const { settings } = useGuard1275();
  const [activeTab, setActiveTab] = useState<"work_order" | "safety_event" | "documents">("work_order");
  const [title, setTitle] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If safety is disabled, force tab to work_order
  if (!settings.safetyEnabled && activeTab === "safety_event") {
    setActiveTab("work_order");
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      setIsSubmitted(true);
      // Reset after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  const renderField = (
    label: string, 
    isRequired: boolean, 
    placeholder: string, 
    value?: string, 
    onChange?: (val: string) => void,
    onKeyDown?: (e: React.KeyboardEvent) => void,
    icon?: React.ReactNode, 
    isFullWidth = false,
    isReadOnly = true
  ) => (
    <div className={`mb-5 ${isFullWidth ? 'col-span-2' : ''}`}>
      <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50/30' : 'bg-white'}`}
          readOnly={isReadOnly}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="bg-white h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check size={40} className="text-green-600" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety Event Created!</h2>
        <p className="text-gray-500 mb-8">Thank you for reporting this issue. Our team has been notified.</p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            setTitle("");
          }}
          className="text-blue-600 font-semibold hover:underline"
        >
          Report another issue
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-full overflow-y-auto flex flex-col font-sans">
      {/* ... existing header code ... */}
      <div className="bg-[#1e40af] text-white pt-12 pb-24 px-6 text-center shrink-0">
        <div className="flex justify-between items-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-white rounded-full relative">
                 <div className="absolute inset-0 border-t-2 border-white rounded-full rotate-45"></div>
               </div>
             </div>
             <span className="font-bold text-xl tracking-tight">UpKeep</span>
          </div>
          <button className="text-sm font-semibold hover:underline">Sign In</button>
        </div>

        <h1 className="text-4xl font-bold mb-3 tracking-tight">Let's Report the Issue</h1>
        <p className="text-blue-100 mb-8 text-lg">Tell us what's happening and we'll guide you through the rest</p>
        
        <div className="max-w-2xl mx-auto bg-[#1d3557]/40 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 text-left border border-white/10">
          <MapPin className="text-blue-300" size={24} />
          <span className="text-lg">You're reporting an issue for <strong className="font-bold">New York</strong></span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto w-full px-6 -mt-12 pb-20 flex-1">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          
          {/* Tabs */}
          <div className="flex px-6 pt-6 gap-4 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("work_order")}
              className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === "work_order" ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Work Order
            </button>
            {settings.safetyEnabled && (
              <button
                onClick={() => setActiveTab("safety_event")}
                className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
                  activeTab === "safety_event" ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Safety Event
              </button>
            )}
            {settings.documentsEnabled && (
              <button
                onClick={() => setActiveTab("documents")}
                className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
                  activeTab === "documents" ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Documents
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "work_order" ? (
              <div className="animate-in fade-in duration-300">
                <div className="bg-blue-50/80 border border-blue-100 text-blue-800 p-4 rounded-lg text-sm mb-6 flex items-start gap-3">
                  <div className="mt-0.5 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px] font-bold italic">i</div>
                  <p>Use Work Orders to request maintenance, repairs, or report broken equipment.</p>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-5 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-800 text-base shadow-sm"
                    placeholder="Start describing the problem..."
                    readOnly
                  />
                  <button className="absolute bottom-5 right-5 p-3 bg-gray-50 rounded-full text-blue-600 hover:bg-gray-100 border border-gray-200 transition-colors">
                    <Mic size={24} />
                  </button>
                </div>
              </div>
            ) : activeTab === "safety_event" ? (
              <div className="animate-in slide-in-from-bottom-2 duration-400">
                <div className="bg-[#fef9c3] border border-yellow-200 text-yellow-900 p-4 rounded-lg text-sm mb-8 flex items-start gap-3">
                  <div className="mt-0.5 bg-[#ca8a04] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px] font-bold italic">i</div>
                  <p>Use Safety Events to report accidents, near-misses, or hazardous observations.</p>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">Safety Event Details</h3>
                <p className="text-sm text-gray-500 mb-8">Please provide specific details about the safety event you are reporting.</p>

                <div className="grid grid-cols-2 gap-x-6">
                  {renderField("Title", true, "e.g. Slip on Wet Floor", title, setTitle, handleTitleKeyDown, undefined, true, false)}
                  
                  {renderField("Location", false, "New York", "New York", undefined, undefined, <X size={16} />)}
                  {renderField("Asset", settings.requiredFields.asset, "Select Asset", undefined, undefined, undefined, <ChevronDown size={16} />)}
                  
                  {renderField("Date and Time", true, "Select Date", "14/07/2026, 17:04", undefined, undefined, <Calendar size={16} />)}
                  {renderField("Report Type", true, "Select Type", "Incident", undefined, undefined, <X size={16} />)}
                  
                  {renderField("Severity Level", settings.requiredFields.priority, "Select Severity", "Low", undefined, undefined, <X size={16} />)}
                  {renderField("Hazard Category", settings.requiredFields.category, "Select Category", "Fall", undefined, undefined, <X size={16} />)}

                  <div className="col-span-2 mb-6">
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe the incident..."
                      defaultValue="An individual slipped on a wet floor. No additional details were provided regarding injuries or specific circumstances."
                      readOnly
                    />
                  </div>

                  <div className="col-span-2 mb-8">
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Immediate Actions Taken
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/30"
                      placeholder="What actions were taken immediately?"
                      defaultValue="- Inspect and dry the affected area\n- Place wet floor warning signage\n- Assess the individual for any injuries"
                      readOnly
                    />
                  </div>

                  {renderField("Name (Optional)", false, "Your full name", undefined, undefined, undefined, undefined, false, true)}
                  {renderField("Email (Optional)", false, "your.email@example.com", undefined, undefined, undefined, undefined, false, true)}

                  <div className="col-span-2 mb-8">
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Attachments {settings.requiredFields.attachments && <span className="text-red-500">*</span>}
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="text-blue-600" size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 font-medium italic">Up To 5 files (Images or Docs)</p>
                    </div>
                  </div>

                  <div className="col-span-2 mt-4 flex justify-end">
                    <button 
                      onClick={() => title.trim() && setIsSubmitted(true)}
                      disabled={!title.trim()}
                      className="bg-[#2563eb] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-all shadow-md active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-2 duration-400">
                <div className="bg-blue-50/80 border border-blue-100 text-blue-800 p-4 rounded-lg text-sm mb-8 flex items-start gap-3">
                  <div className="mt-0.5 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px] font-bold italic">i</div>
                  <p>Access important safety documents, guidelines, and procedures.</p>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-6">Company Documents</h3>

                <div className="space-y-3">
                  {settings.documents?.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.type} Document</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Download">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!settings.documents || settings.documents.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No documents available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ... existing footer code ... */}
        <div className="mt-8 text-center border-t border-gray-200 pt-8">
           <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
               <div className="w-4 h-4 border border-white rounded-full"></div>
             </div>
             <span className="font-bold text-gray-400 text-sm">UpKeep</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">© 2026, UpKeep Technologies, Inc.</p>
        </div>
      </div>
    </div>
  );
}

// Add simple Plus icon component if not imported
function Plus({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

