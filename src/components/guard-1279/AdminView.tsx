"use client";

import React, { useState } from "react";
import { useGuard1275 } from "@/src/contexts/Guard1275Context";
import { ShieldAlert, Paperclip, MapPin, Box, Tag, AlertCircle, Globe, X, ChevronDown, Check, Plus, FileText, File } from "lucide-react";

export function AdminView() {
  const { settings, availableDocuments, toggleSafety, toggleDocuments, toggleRequiredField, setDocuments } = useGuard1275();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showDocSelector, setShowDocSelector] = useState(false);

  // Helper for the custom checkbox + toggle row
  const renderOptionRow = (
    label: string, 
    description: string, 
    isChecked: boolean, 
    isRequired: boolean,
    onToggleRequired: () => void
  ) => (
    <div className={`flex items-center justify-between p-4 border rounded-lg mb-3 bg-white ${isChecked ? 'border-blue-200' : 'border-gray-200'}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {/* Custom Checkbox */}
          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
            {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">Required</span>
        <button
          type="button"
          onClick={onToggleRequired}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isRequired ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isRequired ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );

  const handleToggleDoc = (doc: { id: string; name: string; type: string }) => {
    const isSelected = settings.documents?.some(d => d.id === doc.id);
    if (isSelected) {
      setDocuments(settings.documents.filter(d => d.id !== doc.id));
    } else {
      setDocuments([...(settings.documents || []), doc]);
    }
  };

  return (
    <div className="bg-gray-500/20 p-6 h-full overflow-y-auto flex items-start justify-center pt-10 pb-24 relative">
      {/* Document Selector Modal Overlay */}
      {showDocSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setShowDocSelector(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Select Documents</h3>
              <button onClick={() => setShowDocSelector(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-2">
              <p className="text-sm text-gray-500 mb-4">Select the safety documents you want to make available in the portal.</p>
              {availableDocuments.map((doc) => {
                const isSelected = settings.documents?.some(d => d.id === doc.id);
                return (
                  <label key={doc.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={isSelected}
                      onChange={() => handleToggleDoc(doc)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                    {isSelected && <Check size={16} className="text-blue-600" />}
                  </label>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowDocSelector(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Portal</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* Areas & Assets Section */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-gray-900 mb-1">Areas & Assets</h3>
            <p className="text-sm text-gray-500 mb-4">Specify the locations or assets for this portal.</p>
            
            <div className="grid grid-cols-3 gap-4">
              {/* General Portal Card */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center cursor-pointer hover:border-gray-300">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Globe size={20} className="text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">General Portal</h4>
                <p className="text-xs text-gray-500">Allow requests for all locations & assets</p>
              </div>

              {/* Location Portal Card (Selected) */}
              <div className="border-2 border-blue-200 bg-blue-50/50 rounded-lg p-4 flex flex-col items-center text-center cursor-pointer relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Location Portal</h4>
                <p className="text-xs text-gray-500 mb-3">Limit requests to specific location(s)</p>
                <button className="w-full bg-white border border-gray-300 rounded-md py-1.5 px-3 text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span>New York (1)</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Asset Portal Card */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center cursor-pointer hover:border-gray-300">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Box size={20} className="text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Asset Portal</h4>
                <p className="text-xs text-gray-500">Limit requests to specific asset(s)</p>
              </div>
            </div>
          </div>

          {/* Request Options Section */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-gray-900 mb-1">Request Options</h3>
            <p className="text-sm text-gray-500 mb-4">Enable or disable optional fields.</p>
            
            {renderOptionRow(
              "Attachments",
              "Let users upload up to 5 photos or files.",
              true, // Always checked in the UI screenshot
              settings.requiredFields.attachments,
              () => toggleRequiredField("attachments")
            )}
            {renderOptionRow(
              "Location",
              "Let users specify the exact location.",
              true,
              settings.requiredFields.location,
              () => toggleRequiredField("location")
            )}
            {renderOptionRow(
              "Asset",
              "Let users specify an asset.",
              true,
              settings.requiredFields.asset,
              () => toggleRequiredField("asset")
            )}
            {renderOptionRow(
              "Category",
              "Let users choose a category.",
              true,
              settings.requiredFields.category,
              () => toggleRequiredField("category")
            )}
            {renderOptionRow(
              "Priority",
              "Let users select an urgency level.",
              true,
              settings.requiredFields.priority,
              () => toggleRequiredField("priority")
            )}
          </div>

          {/* Safety Module Section (Combined GUARD-1279) */}
          <div className="mb-8 p-5 bg-blue-50/30 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="text-blue-600" size={20} />
              <h3 className="text-base font-bold text-gray-900">Safety Module</h3>
            </div>
            
            {/* Safety Event Creation Toggle */}
            <div className={`flex items-center justify-between p-4 border rounded-lg bg-white mb-4 ${settings.safetyEnabled ? 'border-blue-200 shadow-sm' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${settings.safetyEnabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                    {settings.safetyEnabled && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Allow Safety Event creation</p>
                  <p className="text-sm text-gray-500">Users can report events, near-misses, and hazards.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSafety}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.safetyEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.safetyEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Documents Tab Toggle */}
            <div className={`flex items-center justify-between p-4 border rounded-lg bg-white ${settings.documentsEnabled ? 'border-blue-200 shadow-sm' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${settings.documentsEnabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                    {settings.documentsEnabled && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Show Documents Tab</p>
                  <p className="text-sm text-gray-500">Provide access to safety reference documents (SOPs, JHAs).</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDocuments}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.documentsEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.documentsEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Document Selection Interface */}
            {settings.documentsEnabled && (
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">Selected Documents</h4>
                  <button 
                    onClick={() => setShowDocSelector(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Plus size={14} /> Select Documents
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {settings.documents && settings.documents.length > 0 ? (
                    settings.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg group hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                            <File size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{doc.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleToggleDoc(doc)}
                          className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-white border border-dashed border-gray-300 rounded-lg">
                      <p className="text-xs text-gray-400">No documents selected. Click 'Select Documents' to add some.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button 
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center justify-between w-full py-2 text-left"
            >
              <h3 className="text-base font-bold text-gray-900">Advanced options</h3>
              <ChevronDown size={20} className={`text-gray-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {advancedOpen && (
              <div className="mt-4 space-y-3">
                {/* Mock rows for advanced options */}
                {["Due Date", "Assigned user", "Team"].map((opt) => (
                  <div key={opt} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded border border-gray-300 bg-white" />
                      <p className="font-semibold text-gray-900 text-sm">{opt}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-medium">Required</span>
                      <div className="relative inline-flex h-5 w-9 rounded-full border-2 border-transparent bg-gray-200">
                        <span className="inline-block h-4 w-4 rounded-full bg-white shadow ring-0" />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Custom Fields</h4>
                    <button className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50">
                      <Plus size={16} /> Add Custom Field
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Add extra fields to collect specific details when someone submits a request.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Update Request Portal
          </button>
        </div>

      </div>
    </div>
  );
}
