"use client";

import React, { useState } from "react";
import { useAccessPoint } from "../contexts/AccessPointContext";
import { useTemplate } from "../contexts/TemplateContext";
import LocationSelector from "./LocationSelector";
import { LocationSelection } from "../schemas/locations";
import { mockLocationHierarchy } from "../samples/locationHierarchy";

interface CreateAccessPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export default function CreateAccessPointModal({
  isOpen,
  onClose,
  onSuccess
}: CreateAccessPointModalProps) {
  const { createAccessPoint } = useAccessPoint();
  const { templates } = useTemplate();
  
  const [name, setName] = useState("");
  const [location, setLocation] = useState<LocationSelection | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [lastOpenState, setLastOpenState] = useState(isOpen);

  // Reset form when modal opens - track previous state to detect transition
  if (isOpen && !lastOpenState) {
    setName("");
    setLocation(null);
    setSelectedTemplateIds([]);
  }
  if (isOpen !== lastOpenState) {
    setLastOpenState(isOpen);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !location || selectedTemplateIds.length === 0) {
      return;
    }
    
    const newId = createAccessPoint(
      name.trim(),
      location,
      undefined,
      selectedTemplateIds
    );
    
    onSuccess(newId);
  };

  const handleCancel = () => {
    setName("");
    setLocation(null);
    setSelectedTemplateIds([]);
    onClose();
  };

  const isValid = name.trim().length > 0 && location !== null && selectedTemplateIds.length > 0 && selectedTemplateIds.length <= 5;

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplateIds(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        if (prev.length >= 5) {
          return prev; // Max 5 templates
        }
        return [...prev, templateId];
      }
    });
  };

  // Get active templates only
  const activeTemplates = Object.values(templates).filter(t => t.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-5"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Access Point</h2>
              <p className="text-xs text-gray-500 mt-0.5">Create a QR code access point for safety event reporting.</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
            {/* Name */}
            <div>
              <label htmlFor="accessPointName" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                id="accessPointName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter access point name"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <LocationSelector
                initialSelection={location}
                onChange={setLocation}
                locationTree={mockLocationHierarchy}
                required={true}
                label="Location"
              />
            </div>

            {/* Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Templates <span className="text-gray-500 font-normal">(Select 1-5 templates)</span>
              </label>
              {activeTemplates.length === 0 ? (
                <p className="text-xs text-amber-600">
                  No active templates available. Please create and activate a template first.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {activeTemplates.map((template) => {
                    const isSelected = selectedTemplateIds.includes(template.templateId);
                    return (
                      <label
                        key={template.templateId}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTemplateToggle(template.templateId)}
                          disabled={!isSelected && selectedTemplateIds.length >= 5}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          {template.fields && (
                            <div className="text-xs text-gray-500">
                              {template.fields.length} fields
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedTemplateIds.length > 0 && (
                <p className="mt-2 text-xs text-gray-600">
                  {selectedTemplateIds.length} template{selectedTemplateIds.length !== 1 ? 's' : ''} selected
                  {selectedTemplateIds.length >= 5 && " (maximum reached)"}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Generate QR Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




