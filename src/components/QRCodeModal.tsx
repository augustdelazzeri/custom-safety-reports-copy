"use client";

import React from "react";
import { useAccessPoint } from "../contexts/AccessPointContext";
import { useTemplate } from "../contexts/TemplateContext";

interface QRCodeModalProps {
  accessPointId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({
  accessPointId,
  isOpen,
  onClose
}: QRCodeModalProps) {
  const { getAccessPoint } = useAccessPoint();
  const { templates } = useTemplate();
  
  if (!isOpen) return null;
  
  const accessPoint = getAccessPoint(accessPointId);
  
  if (!accessPoint) return null;

  // Build URL based on number of templates
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const templateIdsParam = accessPoint.templateIds.length === 1
    ? `templateId=${accessPoint.templateIds[0]}`
    : `templateIds=${accessPoint.templateIds.join(',')}`;
  const fullUrl = `${baseUrl}/safety-events/template-form?${templateIdsParam}&accessPointId=${accessPoint.id}&location=${encodeURIComponent(accessPoint.location.fullPath)}`;
  
  // Get template names for display
  const templateNames = accessPoint.templateIds
    .map(id => templates[id]?.name)
    .filter(Boolean);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    // Could add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{accessPoint.name} QR Code</h2>
          <p className="text-sm text-gray-600 mt-1">
            Scan this QR code to report a safety event at this location.
            {accessPoint.templateIds.length > 1 && (
              <span className="block mt-1 font-medium">
                {accessPoint.templateIds.length} templates available
              </span>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* QR Code Display */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex items-center justify-center mb-4">
            {/* Placeholder QR Code - using a styled div to represent it */}
            <div className="relative w-64 h-64 bg-white flex items-center justify-center">
              {/* QR Code Pattern (simplified representation) */}
              <svg className="w-full h-full" viewBox="0 0 256 256" fill="none">
                {/* Top-left corner */}
                <rect x="0" y="0" width="64" height="64" fill="black"/>
                <rect x="8" y="8" width="48" height="48" fill="white"/>
                <rect x="16" y="16" width="32" height="32" fill="black"/>
                
                {/* Top-right corner */}
                <rect x="192" y="0" width="64" height="64" fill="black"/>
                <rect x="200" y="8" width="48" height="48" fill="white"/>
                <rect x="208" y="16" width="32" height="32" fill="black"/>
                
                {/* Bottom-left corner */}
                <rect x="0" y="192" width="64" height="64" fill="black"/>
                <rect x="8" y="200" width="48" height="48" fill="white"/>
                <rect x="16" y="208" width="32" height="32" fill="black"/>
                
                {/* Random pattern blocks to simulate QR code */}
                <rect x="80" y="20" width="8" height="8" fill="black"/>
                <rect x="96" y="20" width="8" height="8" fill="black"/>
                <rect x="112" y="20" width="8" height="8" fill="black"/>
                <rect x="80" y="36" width="8" height="8" fill="black"/>
                <rect x="104" y="36" width="8" height="8" fill="black"/>
                <rect x="80" y="52" width="8" height="8" fill="black"/>
                <rect x="96" y="52" width="8" height="8" fill="black"/>
                
                {/* More pattern blocks */}
                <rect x="20" y="80" width="8" height="8" fill="black"/>
                <rect x="36" y="80" width="8" height="8" fill="black"/>
                <rect x="52" y="80" width="8" height="8" fill="black"/>
                <rect x="20" y="96" width="8" height="8" fill="black"/>
                <rect x="44" y="96" width="8" height="8" fill="black"/>
                <rect x="28" y="112" width="8" height="8" fill="black"/>
                <rect x="52" y="112" width="8" height="8" fill="black"/>
                
                {/* Center icon overlay */}
                <circle cx="128" cy="128" r="24" fill="white"/>
                <circle cx="128" cy="128" r="20" fill="#DC2626"/>
              </svg>
              
              {/* UpKeep shield icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-1">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* URL and Details */}
          <div className="space-y-3">
            {/* URL */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
              <code className="flex-1 text-xs text-gray-600 break-all font-mono">
                {fullUrl}
              </code>
              <button
                onClick={handleCopyUrl}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Templates */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Templates:</p>
              <div className="flex flex-wrap gap-2">
                {templateNames.map((name, index) => (
                  <span
                    key={accessPoint.templateIds[index]}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-medium text-gray-500">Location:</p>
              <p className="text-sm text-gray-900 mt-0.5">{accessPoint.location.fullPath}</p>
            </div>

            {/* Success message */}
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                This QR code has been saved to your access points list and will remain after refresh.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Placeholder for print/download functionality
              alert("Print/Download PDF functionality would be implemented here");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}




