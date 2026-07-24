"use client";

import React from "react";
import Link from "next/link";
import { useTemplate } from "../contexts/TemplateContext";

interface TemplateSelectorProps {
  templateIds: string[];
  accessPointId?: string;
  location?: string;
  asset?: string;
}

export default function TemplateSelector({ templateIds, accessPointId, location, asset }: TemplateSelectorProps) {
  const { templates } = useTemplate();
  
  // Handle case where templates might not be loaded yet
  if (!templates || typeof templates !== 'object') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const availableTemplates = templateIds
    .map(id => templates[id])
    .filter(t => t && t.status === 'active');

  if (availableTemplates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Templates Available</h2>
            <p className="text-gray-600">The selected templates are not available or have been archived.</p>
          </div>
        </div>
      </div>
    );
  }

  // Build URL parameters
  const buildUrlParams = (selectedTemplateId: string) => {
    const params = new URLSearchParams();
    params.set('templateId', selectedTemplateId);
    if (accessPointId) params.set('accessPointId', accessPointId);
    if (location) params.set('location', location);
    if (asset) params.set('asset', asset);
    return `/safetyevents/template-form?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select a Template</h1>
          <p className="text-gray-600">Choose which safety event template you&apos;d like to use for this report.</p>
        </div>

        <div className="space-y-3">
          {availableTemplates.map((template) => (
            <Link
              key={template.templateId}
              href={buildUrlParams(template.templateId)}
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                    {template.name}
                  </h3>
                  {template.fields && (
                    <p className="text-sm text-gray-600">
                      {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <svg 
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {location && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Location: {location}</span>
              {asset && (
                <>
                  <span className="mx-2">•</span>
                  <span>Asset: {asset}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



