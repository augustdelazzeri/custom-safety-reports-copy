"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import { useCAPAs } from "../../../src/contexts/CAPAContext";
import { mockUsers } from "../../../src/samples/mockUsers";
import { mockLocationHierarchy } from "../../../src/samples/locationHierarchy";
import LocationSelector from "../../../src/components/LocationSelector";
import { LocationSelection } from "../../../src/schemas/locations";

export default function CreateCAPA() {
  const router = useRouter();
  const { addCAPA } = useCAPAs();
  const [formData, setFormData] = useState({
    title: "",
    type: "corrective" as "corrective" | "preventive" | "both",
    eventId: "",
    location: null as LocationSelection | null,
    rcaMethod: "5_whys",
    rcaFindings: "",
    rootCauseCategories: [] as string[],
    actionsToAddress: "",
    ownerId: "",
    dueDate: "",
    priority: "low" as "low" | "medium" | "high",
    tags: [] as string[],
    teamMembersToNotify: [] as string[],
  });

  const [isRecording, setIsRecording] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");

  const activeUsers = mockUsers.filter(u => u.status === "active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find owner name from ID
    const owner = mockUsers.find(u => u.id === formData.ownerId);
    
    if (!owner || !formData.title || !formData.rcaFindings || !formData.actionsToAddress) {
      alert("Please fill in all required fields: Title, Owner, RCA Findings, and Proposed Actions");
      return;
    }
    
    addCAPA({
      title: formData.title,
      type: formData.type,
      status: "open",
      priority: formData.priority,
      linkedSafetyEventId: formData.eventId || undefined,
      location: formData.location || undefined,
      rcaMethod: formData.rcaMethod,
      rcaFindings: formData.rcaFindings,
      rootCauseCategories: formData.rootCauseCategories,
      proposedActions: formData.actionsToAddress,
      ownerId: formData.ownerId,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags,
      teamMembersToNotify: formData.teamMembersToNotify,
      createdBy: formData.ownerId,
    });
    
    router.push("/capas");
  };

  const handleCancel = () => {
    router.push("/capas");
  };

  const toggleRootCauseCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      rootCauseCategories: prev.rootCauseCategories.includes(category)
        ? prev.rootCauseCategories.filter(c => c !== category)
        : [...prev.rootCauseCategories, category]
    }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const rootCauseCategories = ["Human Error", "Equipment Failure", "Environmental", "Procedural", "Other"];
  const availableTags = ["Training", "Policy", "Hazard", "Equipment", "Procedure", "Personnel", "Safety"];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header title="Create CAPA" />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-blue-600">Create CAPA</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for this CAPA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* CAPA Type and Link to Safety Event */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CAPA Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "corrective" | "preventive" | "both" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="corrective">Corrective</option>
                    <option value="preventive">Preventive</option>
                    <option value="both">Both</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select whether this is a corrective action, preventive action, or both.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to Safety Event
                  </label>
                  <input
                    type="text"
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    placeholder="Search and select a safety event..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Link this CAPA to a safety event. Linked CAPAs will show on the safety event record.
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <LocationSelector
                  initialSelection={formData.location}
                  onChange={(selection) => setFormData({ ...formData, location: selection })}
                  locationTree={mockLocationHierarchy}
                  required={false}
                  storageKey="ehs-capa-location-mode"
                  label="Location"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specific area where the CAPA will be implemented
                </p>
              </div>

              {/* Root Cause Analysis Section */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
                  </svg>
                  <h2 className="text-lg font-medium text-gray-900">Root Cause Analysis</h2>
                </div>

                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 mb-4">
                    Use your voice to describe the safety event investigation, the RCA method used, and the proposed actions to address the root cause(s).
                  </p>

                  {/* Voice/Type Toggle and Recording Interface */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Assist
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <div className="inline-flex p-1 bg-white border border-indigo-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setInputMode("voice")}
                          className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                            inputMode === "voice" 
                              ? "bg-indigo-100 text-indigo-700" 
                              : "text-gray-600 hover:bg-indigo-50"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          Voice
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode("type")}
                          className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                            inputMode === "type" 
                              ? "bg-indigo-100 text-indigo-700" 
                              : "text-gray-600 hover:bg-indigo-50"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Type
                        </button>
                      </div>
                    </div>

                    <p className="text-center text-sm font-medium text-gray-600">
                      Click to record your description (max 60s)
                    </p>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setIsRecording(!isRecording)}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                          isRecording 
                            ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* RCA Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RCA Method Used
                  </label>
                  <select
                    value={formData.rcaMethod}
                    onChange={(e) => setFormData({ ...formData, rcaMethod: e.target.value })}
                    className="w-fit px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="5_whys">5 Whys</option>
                    <option value="fishbone">Fishbone Diagram</option>
                    <option value="fault_tree">Fault Tree Analysis</option>
                    <option value="other">Other Method</option>
                    <option value="not_selected">Not Selected</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the method used to analyze the root cause
                  </p>
                </div>

                {/* RCA Findings */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RCA Findings & Conclusion <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.rcaFindings}
                      onChange={(e) => setFormData({ ...formData, rcaFindings: e.target.value })}
                      placeholder="Document your findings and root cause analysis conclusion here. If using 5 Whys, include all questions and answers."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-gray-900"
                      required
                    />
                    <button
                      type="button"
                      disabled
                      className="absolute right-2 bottom-2 px-2 py-1 text-xs bg-white/90 border border-gray-300 rounded text-gray-400 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Writing Assist
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Document your findings and root cause analysis conclusion based on the 5 Whys method.
                  </p>
                </div>

                {/* Root Cause Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identified Root Cause Categories
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rootCauseCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleRootCauseCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          formData.rootCauseCategories.includes(category)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select all applicable root cause categories identified in your analysis. Multiple causes can contribute to an event.
                  </p>
                </div>
              </div>

              {/* Proposed Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Actions <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={formData.actionsToAddress}
                    onChange={(e) => setFormData({ ...formData, actionsToAddress: e.target.value })}
                    placeholder="Based on the RCA, what specific corrective and preventive actions are planned to eliminate the root cause and prevent recurrence?"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    disabled
                    className="absolute right-2 bottom-2 px-2 py-1 text-xs bg-white/90 border border-gray-300 rounded text-gray-400 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Writing Assist
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on the RCA findings, what specific corrective and preventive actions are planned to eliminate the root cause and prevent recurrence. Include both immediate actions and long-term preventive measures.
                </p>
              </div>

              {/* Media Upload Section */}
              <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-white">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Add images, photos, videos, or documents (optional)
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload supporting documentation or evidence for this corrective action.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Browse Media
                  </button>
                </div>

                <div className="mt-3 flex justify-center">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    5 items remaining
                  </div>
                </div>
              </div>

              {/* Linked Documents */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
                  </svg>
                  <h2 className="text-base font-medium text-gray-900">Linked Documents</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Hazard Analyses (JHAs)
                    </label>
                    <input
                      type="text"
                      placeholder="Search and select relevant JHAs..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Associate relevant Job Hazard Analyses with this CAPA.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Operating Procedures (SOPs)
                    </label>
                    <input
                      type="text"
                      placeholder="Search and select approved/active SOPs..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Associate relevant approved/active Standard Operating Procedures with this CAPA.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Orders
                    </label>
                    <input
                      type="text"
                      placeholder="Search and select relevant work orders..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Associate relevant Work Orders with this CAPA.
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner, Due Date, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select an owner</option>
                    {activeUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.roleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-4 mt-2">
                    {["low", "medium", "high"].map((priority) => (
                      <label key={priority} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={formData.priority === priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.tags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Add tags to categorize this CAPA (e.g., Training, Procedure, Equipment).
                </p>
              </div>

              {/* Team Members to Notify */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members to Notify
                </label>
                <input
                  type="text"
                  placeholder="Select team members to notify"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select team members who should be notified about this CAPA update.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-w-[120px]"
                >
                  Create CAPA
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
