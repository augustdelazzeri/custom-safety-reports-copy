"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import { TemplateProvider, useTemplate } from "../../../src/contexts/TemplateContext";
import ValidationErrorsModal from "../../../src/components/ValidationErrorsModal";
import CreateTemplateModal from "../../../src/components/CreateTemplateModal";
import type { ValidationError } from "../../../src/utils/templateValidation";

function TemplatesListContent() {
  const router = useRouter();
  const { templates, createTemplate, duplicateTemplate, archiveTemplate, updateTemplateStatus, checkDuplicateTemplateName, saveTemplates } = useTemplate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleSubmitNewTemplate = (name: string) => {
    const newId = createTemplate(name);
    // createTemplate now saves to localStorage automatically
    router.push(`/settings/safety-templates/${newId}`);
  };

  const handleDuplicate = (templateId: string) => {
    const newId = duplicateTemplate(templateId);
    // duplicateTemplate now saves to localStorage automatically
    setOpenMenuId(null);
    router.push(`/settings/safety-templates/${newId}`);
  };

  const handleArchive = (templateId: string) => {
    if (confirm("Are you sure you want to archive this template?")) {
      archiveTemplate(templateId);
      saveTemplates(); // Save to localStorage
      setOpenMenuId(null);
    }
  };

  const handleStatusChange = (templateId: string, newStatus: 'draft' | 'active' | 'archived') => {
    const result = updateTemplateStatus(templateId, newStatus);
    
    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      setShowValidationModal(true);
    } else {
      saveTemplates(); // Save to localStorage on success
    }
    
    setOpenMenuId(null);
  };

  // Filter templates
  const filteredTemplates = Object.values(templates).filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-700 border-gray-200";
      case "active": return "bg-blue-100 text-blue-700 border-blue-200";
      case "archived": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
      
        {/* Main Content */}
        <main className="p-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Safety Templates</h1>
              <p className="text-sm text-gray-600 mt-1">
                Configure and manage Safety Event form templates
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Template
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center gap-4">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery || statusFilter !== "all" 
                          ? "No templates match your filters" 
                          : "No templates yet"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your search or filter criteria to see more results."
                          : "Create your first safety event template to get started. Templates define the fields and structure of your safety event forms."}
                      </p>
                      {(!searchQuery && statusFilter === "all") && (
                        <button
                          onClick={handleCreateTemplate}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Your First Template
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr 
                    key={template.templateId} 
                    onClick={() => router.push(`/settings/safety-templates/${template.templateId}`)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${template.status === 'archived' ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/settings/safety-templates/${template.templateId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {template.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={template.status}
                        onChange={(e) => handleStatusChange(template.templateId, e.target.value as 'draft' | 'active' | 'archived')}
                        className={`px-2 py-1 text-xs font-medium rounded border cursor-pointer ${getStatusBadgeColor(template.status)}`}
                        disabled={template.status === 'archived'}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {template.owner}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(template.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(template.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {template.usage.qrCodesLinked} QR codes
                    </td>
                    <td className="px-6 py-4 text-sm relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === template.templateId ? null : template.templateId)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      {openMenuId === template.templateId && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <Link
                              href={`/settings/safety-templates/${template.templateId}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Edit Template
                            </Link>
                            <button
                              onClick={() => handleDuplicate(template.templateId)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Duplicate
                            </button>
                            {template.status !== "archived" && (
                              <button
                                onClick={() => handleArchive(template.templateId)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </main>
      </div>

      {/* Validation Errors Modal */}
      <ValidationErrorsModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
        title="Cannot Activate Template"
      />

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitNewTemplate}
        checkDuplicateName={checkDuplicateTemplateName}
      />
    </div>
  );
}

export default function SafetyTemplatesPage() {
  return (
    <TemplateProvider>
      <TemplatesListContent />
    </TemplateProvider>
  );
}
