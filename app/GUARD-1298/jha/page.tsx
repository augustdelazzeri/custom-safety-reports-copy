"use client";

import React from "react";
import Sidebar from "@/src/components/Sidebar";
import Header from "@/src/components/Header";
import Link from "next/link";
import { Plus, Search, Filter, HardHat, ChevronRight } from "lucide-react";

export default function JhaListPage() {
  const documents = [
    { id: "123", title: "Electrical Maintenance - Production Line 3", location: "Line 3", status: "Approved", owner: "Joty Grewal", date: "Jul 15, 2026" },
    { id: "124", title: "Chemical Handling - Storage Room", location: "Storage A", status: "In Review", owner: "Sarah Austin", date: "Jul 18, 2026" },
    { id: "125", title: "Forklift Operation - Main Warehouse", location: "Warehouse", status: "Draft", owner: "Marcus Schmidt", date: "Jul 20, 2026" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title="Job Hazard Analysis" />

        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">Job Hazard Analysis</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and create safety documentations for your team</p>
            </div>
            <Link 
              href="/GUARD-1298/jha/new" 
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus className="size-5" />
              Create JHA
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by title, ID or owner..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <Filter className="size-4" />
                Filters
              </button>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900 font-bold">3</span> documents
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <HardHat className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500 font-medium">JHA-{doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-700">{doc.location}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-700">{doc.owner}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        doc.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                        doc.status === "In Review" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-500">{doc.date}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/GUARD-1298/jha/${doc.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-flex transition-all"
                      >
                        <ChevronRight className="size-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
