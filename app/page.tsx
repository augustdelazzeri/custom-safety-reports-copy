"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "../src/components/Sidebar";
import { useActionPermission } from "../src/hooks/usePermissions";

interface DummyEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  location: string;
  dateTime: string;
  osha: string;
  isAllFields?: boolean;
}

// Dummy data for safety events
const dummyEvents = [
  { id: "all-fields", title: "All Fields", type: "Example", status: "Open", severity: "Low", location: "Demo", dateTime: "Jan 15, 2025 2:30 PM", osha: "No", isAllFields: true },
  { id: "SE-0002", title: "Fall Incident in Staircase H", type: "Incident", status: "Open", severity: "Low", location: "Suite B", dateTime: "Jul 7, 2025 9:53 AM", osha: "No" },
  { id: "SE-0003", title: "Garbage Accumulation Near Building", type: "Observation", status: "Open", severity: "Low", location: "No location", dateTime: "Jul 7, 2025 9:54 AM", osha: "No" },
  { id: "SE-0004", title: "Oil Spill Near Pump 42", type: "Observation", status: "In Review", severity: "Low", location: "Suite B", dateTime: "Jul 7, 2025 10:18 AM", osha: "No" },
  { id: "SE-0006", title: "Worker Slips and Falls Due to Oil Spill", type: "Incident", status: "In Review", severity: "Medium", location: "Joty's Manufacturing Plant", dateTime: "Jul 15, 2025 10:10 AM", osha: "No" },
  { id: "SE-0021", title: "Water leakage from broken pipe in Manufacturing Plant Five", type: "Observation", status: "In Review", severity: "Medium", location: "Willy Wonka's Chocolate Factory", dateTime: "Sep 17, 2025 2:13 PM", osha: "No" },
  { id: "SE-0022", title: "Fall in cafeteria due to fridge leak", type: "Incident", status: "Open", severity: "High", location: "Willy Wonka's Chocolate Factory", dateTime: "Sep 22, 2025 12:00 AM", osha: "No" },
  { id: "SE-0009", title: "Oil Leak on Floor 8", type: "Observation", status: "Closed", severity: "High", location: "Joty's Manufacturing Plant", dateTime: "Jul 25, 2025 1:14 PM", osha: "Yes" },
  { id: "SE-0008", title: "Worker Slipped on Oil Spill", type: "Incident", status: "Closed", severity: "High", location: "UpKeep HQ", dateTime: "Jul 18, 2025 9:37 AM", osha: "Yes" },
  { id: "SE-0010", title: "Customer Foot Injury Due to Tripping on Box", type: "Customer Incident", status: "Open", severity: "Low", location: "Willy Wonka's Chocolate Factory", dateTime: "Jul 29, 2025 12:35 PM", osha: "No" },
  { id: "SE-0014", title: "Water Spill Reported", type: "Incident", status: "Open", severity: "Low", location: "No location", dateTime: "Sep 3, 2025 9:34 AM", osha: "No" },
  { id: "SE-0025", title: "Fall injury in elevator", type: "Incident", status: "Open", severity: "Medium", location: "No location", dateTime: "Oct 20, 2025 8:00 AM", osha: "Yes" },
  { id: "SE-0011", title: "Fall from Ladder", type: "Incident", status: "Open", severity: "Low", location: "No location", dateTime: "Jul 31, 2025 2:11 PM", osha: "No" },
  { id: "SE-0012", title: "Fall from Ladder", type: "Incident", status: "Open", severity: "Low", location: "Suite B", dateTime: "Jul 31, 2025 2:12 PM", osha: "No" },
  { id: "SE-0013", title: "Oil Spill Near Machinery Equipment", type: "Observation", status: "Open", severity: "Low", location: "Utility Room", dateTime: "Aug 13, 2025 9:41 AM", osha: "No" },
  { id: "SE-0015", title: "Water Spill in Office Area", type: "Observation", status: "In Review", severity: "Low", location: "Office Area", dateTime: "Sep 5, 2025 8:21 AM", osha: "No" },
  { id: "SE-0016", title: "Customer Fall in Recreation Area", type: "Customer Incident", status: "In Review", severity: "Medium", location: "Office Area", dateTime: "Sep 9, 2025 11:19 AM", osha: "No" },
  { id: "SE-0017", title: "Fall Incident in Cafeteria Due to Coffee Spill", type: "Incident", status: "Open", severity: "Low", location: "Joty's Manufacturing Plant", dateTime: "Sep 11, 2025 3:57 PM", osha: "No" },
];

export default function SafetyEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Permission checks
  const canCreate = useActionPermission("event", "Safety Event", "create");
  const canEdit = useActionPermission("event", "Safety Event", "edit");
  const canArchive = useActionPermission("event", "Safety Event", "archive");
  const canDelete = useActionPermission("event", "Safety Event", "delete");
  const canExport = useActionPermission("event", "Safety Event", "export");

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Incident": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Observation": return "bg-green-100 text-green-700 border-green-200";
      case "Customer Incident": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Near Miss": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-blue-50 text-blue-700 border-blue-200";
      case "In Review": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Closed": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "Low": return "bg-green-50 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "High": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      case "In Review":
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Closed":
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "High") {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 ml-64">
        <div className="px-8 py-3 flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">4</span>
            </button>
            <Link 
              href={canCreate.canPerform ? "/safetyevents/new" : "#"}
              onClick={(e) => !canCreate.canPerform && e.preventDefault()}
              title={canCreate.title}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${canCreate.buttonClass}`}
            >
              + Create
            </Link>
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-medium text-sm">J</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="ml-64 px-8 py-6">
        {/* Page Header with Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Safety Events</h1>
            <p className="text-sm text-gray-600">Track and manage all safety events</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Link 
              href={canCreate.canPerform ? "/safetyevents/new" : "#"}
              onClick={(e) => !canCreate.canPerform && e.preventDefault()}
              title={canCreate.title}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${canCreate.buttonClass}`}
            >
              <span>+ Create Safety Event</span>
            </Link>
            <button 
              disabled={canExport.disabled}
              title={canExport.title || "Export"}
              className={`p-2 border rounded-md transition-colors ${
                canExport.canPerform 
                  ? 'border-gray-300 hover:bg-gray-50' 
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <svg className={`w-5 h-5 ${canExport.canPerform ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Status</span>
            <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option>All</option>
              <option>Open</option>
              <option>In Review</option>
              <option>Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Type</span>
            <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option>All</option>
              <option>Incident</option>
              <option>Observation</option>
              <option>Near Miss</option>
              <option>Customer Incident</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Severity</span>
            <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Location</span>
            <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option>All</option>
              <option>Suite B</option>
              <option>No location</option>
              <option>Joty&apos;s Manufacturing Plant</option>
              <option>Willy Wonka&apos;s Chocolate Factory</option>
              <option>UpKeep HQ</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">OSHA Reportable</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Include Archived</span>
          </label>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Report ID & Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">OSHA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = (event as DummyEvent).isAllFields ? `/safetyevents/${event.id}/all-fields` : `/safetyevents/${event.id}`}>
                  <td className="px-4 py-3">
                    <Link href={(event as DummyEvent).isAllFields ? `/safetyevents/${event.id}/all-fields` : `/safetyevents/${event.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                      <div className="text-sm font-medium text-gray-900">{event.id}</div>
                      <div className="text-sm text-gray-600">{event.title}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getTypeBadgeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusBadgeColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${getSeverityBadgeColor(event.severity)}`}>
                      {getSeverityIcon(event.severity)}
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{event.dateTime}</td>
                  <td className="px-4 py-3">
                    {event.osha === "Yes" ? (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <span className="text-sm text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Show dropdown menu
                        }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0 6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0 6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
