"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../src/components/Sidebar";
import Header from "../../src/components/Header";
import { useAccessPoint } from "../../src/contexts/AccessPointContext";
import { TemplateProvider } from "../../src/contexts/TemplateContext";
import CreateAccessPointModal from "../../src/components/CreateAccessPointModal";
import QRCodeModal from "../../src/components/QRCodeModal";
import { useActionPermission } from "../../src/hooks/usePermissions";
import { useOnboarding } from "../../src/hooks/useOnboarding";

function AccessPointsListContent() {
  const { getAllAccessPoints, archiveAccessPoint } = useAccessPoint();
  const { setStepComplete } = useOnboarding();
  const canCreate = useActionPermission("access-point", "Access Point", "create");
  const canEdit = useActionPermission("access-point", "Access Point", "edit");
  const canArchive = useActionPermission("access-point", "Access Point", "archive");
  const canDelete = useActionPermission("access-point", "Access Point", "delete");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const accessPoints = getAllAccessPoints();

  // Filter access points
  const filteredAccessPoints = accessPoints.filter(ap => {
    const matchesSearch = ap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ap.location.fullPath.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ap.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-50 text-green-700 border-green-200";
      case "archived": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this access point?")) {
      archiveAccessPoint(id);
      setOpenMenuId(null);
    }
  };

  const handleShowQRCode = (id: string) => {
    setSelectedAccessPoint(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
      
        {/* Main Content */}
        <main className="px-8 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Access Points</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Track and manage all access points across your organization.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => canCreate.canPerform && setShowCreateModal(true)}
                disabled={canCreate.disabled}
                title={canCreate.title}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm flex items-center gap-2 ${canCreate.buttonClass}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Access Point
              </button>
              <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search and Filters Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="flex flex-col gap-5">
              {/* Search Row */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-2xl">
                  <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, location, or asset..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 shadow-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Advanced Filters
                </button>
              </div>

              {/* Quick Filters Row */}
              <div className="flex items-center gap-6 flex-wrap border-t border-gray-100 pt-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['all', 'active', 'archived'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                          statusFilter === status
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-6 w-px bg-gray-200" />

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</span>
                  <select className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors">
                    <option>All Locations</option>
                    <option>Chicago Plant</option>
                    <option>Berlin Factory</option>
                    <option>Austin Facility</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-gray-200" />

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Created By</span>
                  <select className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors">
                    <option>All Users</option>
                    <option>Joty Grewal</option>
                    <option>Jennifer Chen</option>
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="w-4 h-4 border-2 border-gray-300 rounded transition-all duration-200 peer-checked:bg-blue-600 peer-checked:border-blue-600" />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Show Archived</span>
                  </label>
                  <button 
                    onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                    className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Access Point Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!mounted ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-500">Loading access points...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAccessPoints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <span className="text-lg font-bold text-gray-900">No results found</span>
                        <span className="text-sm text-gray-500">Try adjusting your search or filters to find what you&apos;re looking for.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAccessPoints.map((ap) => (
                    <tr key={ap.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ap.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="font-medium truncate max-w-[200px]">{ap.location.fullPath}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600">{ap.asset || <span className="text-gray-300">—</span>}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold border border-blue-200">
                            {ap.createdBy.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{ap.createdBy}</span>
                            <span className="text-[10px] font-medium text-gray-400">joty.grewal@upkeep.com</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-500">{formatDate(ap.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(ap.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ap.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          {ap.status === 'active' ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleShowQRCode(ap.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View QR Code"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === ap.id ? null : ap.id)}
                              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                              </svg>
                            </button>
                            {openMenuId === ap.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <button
                                    onClick={() => canArchive.canPerform && handleArchive(ap.id)}
                                    disabled={canArchive.disabled}
                                    title={canArchive.title}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition-all duration-200 ${
                                      canArchive.canPerform 
                                        ? 'text-red-600 hover:bg-red-50 cursor-pointer' 
                                        : 'text-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Archive
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Placeholder */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Showing {filteredAccessPoints.length} results</span>
              <div className="flex items-center gap-2">
                <button disabled className="p-1.5 text-gray-300 cursor-not-allowed"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                <button disabled className="p-1.5 text-gray-300 cursor-not-allowed"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Access Point Modal */}
      <CreateAccessPointModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(id) => {
          setShowCreateModal(false);
          setSelectedAccessPoint(id);
          setStepComplete(1);
        }}
      />

      {/* QR Code Modal */}
      {selectedAccessPoint && (
        <QRCodeModal
          accessPointId={selectedAccessPoint}
          isOpen={!!selectedAccessPoint}
          onClose={() => setSelectedAccessPoint(null)}
        />
      )}
    </div>
  );
}

export default function AccessPointsPage() {
  return (
    <TemplateProvider>
      <AccessPointsListContent />
    </TemplateProvider>
  );
}
