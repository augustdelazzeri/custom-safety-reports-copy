"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import { useCAPAs } from "../../../src/contexts/CAPAContext";

export default function CAPADetailsPage() {
  const params = useParams();
  const { getCAPA } = useCAPAs();
  const [auditTrailExpanded, setAuditTrailExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const capaId = params.id as string;
  const capaData = mounted ? getCAPA(capaId) : null;
  
  // Show loading state during SSR and initial client render
  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <Header title="CAPA Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show not found only after mounting on client
  if (!capaData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <Header title="CAPA Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">CAPA Not Found</h2>
              <p className="text-gray-600 mb-4">The CAPA you are looking for does not exist.</p>
              <Link href="/capas" className="text-blue-600 hover:underline">
                Return to CAPA Tracker
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Transform CAPA data to match display format
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${hours}:${minutes} ${ampm}`;
  };
  
  const capa = {
    id: capaData.id,
    title: capaData.title,
    status: capaData.status.charAt(0).toUpperCase() + capaData.status.slice(1).replace("-", " "),
    priority: capaData.priority.charAt(0).toUpperCase() + capaData.priority.slice(1),
    type: capaData.type.charAt(0).toUpperCase() + capaData.type.slice(1),
    owner: {
      name: capaData.ownerName,
      initials: getInitials(capaData.ownerName),
    },
    createdDate: formatDateTime(capaData.createdDate),
    dueDate: capaData.dueDate ? formatDate(capaData.dueDate) : "Not set",
    dueDateDescription: capaData.dueDate ? formatDate(capaData.dueDate) : "Not set",
    description: `A ${capaData.type} action was created to address ${capaData.rootCauseCategories.join(", ")} issues on ${formatDate(capaData.createdDate)}.`,
    rcaSummary: capaData.rcaFindings.split("\n")[0] || "Root cause analysis in progress.",
    proposedActions: capaData.proposedActions.split("\n").filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, "")),
    rcaMethod: capaData.rcaMethod.replace("_", " "),
    rootCauseCategories: capaData.rootCauseCategories.map((cat, idx) => ({
      label: cat,
      color: idx % 2 === 0 ? "orange" : "yellow"
    })),
    rcaFindings: capaData.rcaFindings,
    tags: capaData.tags,
    timeline: [
      {
        status: "Opened",
        date: formatDateTime(capaData.createdDate),
        user: capaData.ownerName,
        icon: "file-plus"
      }
    ]
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header title="CAPA Details" />
        <div className="relative flex-1 overflow-hidden">
          <main className="absolute inset-0 bg-gray-50 overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 w-full border-b bg-white/95 p-4 backdrop-blur">
              <div className="flex flex-col items-start justify-between md:flex-row">
                {/* Desktop Header */}
                <div className="hidden w-full md:block">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Link href="/capas">
                      <button className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-md border bg-white shadow-xs hover:bg-gray-100 text-gray-900 text-sm font-medium transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="m12 19-7-7 7-7" />
                          <path d="M19 12H5" />
                        </svg>
                        <span>Back</span>
                      </button>
                    </Link>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {capa.id}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                      </svg>
                      {capa.status}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {capa.priority}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {capa.type}
                    </span>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold md:text-3xl text-gray-900">{capa.title}</h1>
                </div>

                {/* Mobile Header */}
                <div className="w-full md:hidden">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Link href="/capas">
                      <button className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-md border bg-white shadow-xs hover:bg-gray-100 text-gray-900 text-sm font-medium transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="m12 19-7-7 7-7" />
                          <path d="M19 12H5" />
                        </svg>
                        <span>Back</span>
                      </button>
                    </Link>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {capa.id}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                      </svg>
                      {capa.status}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {capa.priority}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {capa.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h1 className="mb-2 flex-1 pr-3 text-2xl font-bold text-gray-900">{capa.title}</h1>
                    <div className="flex items-center gap-2">
                      <button className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Desktop) */}
                <div className="hidden gap-2 self-start md:flex">
                  <button className="inline-flex items-center justify-center h-8 px-3 rounded-md border bg-white shadow-xs hover:bg-gray-100 text-sm font-medium transition-all text-gray-900">
                    + Create Work Order
                  </button>
                  <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md bg-blue-600 text-white shadow-xs hover:bg-blue-700 text-sm font-medium transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center justify-center h-8 px-3 rounded-md border bg-white shadow-xs hover:bg-gray-100 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Owner: {capa.owner.name}</span>
                </div>
                {capaData.location && (
                  <>
                    <div className="mx-2 hidden sm:block text-gray-400">•</div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>Location: {capaData.location.fullPath}</span>
                    </div>
                  </>
                )}
                <div className="mx-2 hidden sm:block text-gray-400">•</div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  <span>Created: {capa.createdDate}</span>
                </div>
                <div className="mx-2 hidden sm:block text-gray-400">•</div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  <span>Due: {capa.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Section */}
                <section className="space-y-6 md:col-span-2">
                  {/* Summary Card */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                    <p className="mb-4 text-sm leading-relaxed text-gray-700">{capa.description}</p>
                    <p className="mb-4 text-sm leading-relaxed text-gray-700">
                      <span className="font-medium">Due Date:</span> {capa.dueDateDescription}
                    </p>
                    <div className="mt-4 border-t border-blue-200 pt-3">
                      <p className="mb-2 text-sm font-medium text-blue-900">Root Cause Analysis Summary</p>
                      <p className="text-sm leading-relaxed text-gray-700">{capa.rcaSummary}</p>
                    </div>
                  </div>

                  {/* Proposed Actions Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Proposed Actions</h3>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
                        {capa.proposedActions.map((action, index) => (
                          <li key={index} className="pl-1">{action}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Root Cause Analysis Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Root Cause Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">RCA Method Used:</label>
                        <div className="text-gray-700">{capa.rcaMethod}</div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">Identified Root Cause Categories:</label>
                        <div className="flex flex-wrap gap-2">
                          {capa.rootCauseCategories.map((category, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                                category.color === 'orange'
                                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {category.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">RCA Findings & Conclusion:</label>
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{capa.rcaFindings}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
                        <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
                      </svg>
                      <h3 className="font-semibold text-base text-gray-900">Comments</h3>
                    </div>
                    <div className="py-8 text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 h-8 w-8 opacity-50">
                        <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
                      </svg>
                      <p>No comments yet</p>
                      <p className="mt-1 text-xs">Be the first to add a comment</p>
                    </div>
                    <div className="mt-4 border-t bg-white py-4">
                      <div className="flex gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                          {capa.owner.initials}
                        </div>
                        <div className="relative flex-1">
                          <div className="min-h-20 w-full rounded-md border p-3 text-sm text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" contentEditable></div>
                          <div className="pointer-events-none absolute top-3 left-3 text-sm text-gray-500">
                            Add a comment or tag a teammate using @...
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="space-y-1 text-xs text-gray-500">
                              <div>Use @username to mention</div>
                              <div className="opacity-75">
                                Press <kbd className="rounded border bg-gray-100 px-1 py-0.5 text-xs">Cmd</kbd> +{' '}
                                <kbd className="rounded border bg-gray-100 px-1 py-0.5 text-xs">Enter</kbd> to send
                              </div>
                            </div>
                            <button className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md bg-blue-600 text-white shadow-xs hover:bg-blue-700 text-sm font-medium transition-all disabled:opacity-50" disabled>
                              <span className="mr-1 hidden sm:inline">Post</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Sidebar */}
                <aside className="space-y-4">
                  {/* Owner Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Owner</h3>
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                        {capa.owner.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{capa.owner.name}</p>
                        <p className="text-sm text-gray-500">Due: {capa.dueDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Status</h3>
                    <div className="space-y-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                        </svg>
                        {capa.status}
                      </span>
                      <div className="mt-4">
                        <p className="mb-2 text-sm text-gray-500">Update Status:</p>
                        <div className="flex flex-wrap gap-2">
                          <button className="h-8 px-3 rounded-md border bg-gray-100 shadow-xs text-sm font-medium transition-all text-gray-900" disabled>
                            Open
                          </button>
                          <button className="h-8 px-3 rounded-md border bg-white shadow-xs hover:bg-gray-100 text-sm font-medium transition-all text-gray-900">
                            In Review
                          </button>
                          <button className="h-8 px-3 rounded-md border bg-white shadow-xs hover:bg-gray-100 text-sm font-medium transition-all text-gray-900">
                            Closed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {capa.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-transparent">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status Timeline Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Status Timeline</h3>
                    <div>
                      {capa.timeline.map((event, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex items-center">
                            <div className="mr-2 flex flex-col items-center">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                  <path d="M9 15h6" />
                                  <path d="M12 18v-6" />
                                </svg>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">{event.status}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M8 2v4" />
                                  <path d="M16 2v4" />
                                  <rect width="18" height="18" x="3" y="4" rx="2" />
                                  <path d="M3 10h18" />
                                </svg>
                                {event.date}
                              </div>
                              <div className="mt-1 flex items-center text-xs text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                {event.user}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Trail Card */}
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Audit Trail</h3>
                    <button
                      onClick={() => setAuditTrailExpanded(!auditTrailExpanded)}
                      className="flex w-full items-center justify-between py-2 text-left text-sm font-medium hover:underline text-gray-900"
                    >
                      View Internal Log
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          auditTrailExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    
                    {auditTrailExpanded && (
                      <div className="mt-4 border-t pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                <path d="M9 15h6" />
                                <path d="M12 18v-6" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Opened</p>
                              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M8 2v4" />
                                  <path d="M16 2v4" />
                                  <rect width="18" height="18" x="3" y="4" rx="2" />
                                  <path d="M3 10h18" />
                                </svg>
                                Jan 14, 2026 3:42 PM
                              </div>
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                Kaue Delazzeri
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
