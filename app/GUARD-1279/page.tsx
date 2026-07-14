"use client";

import React, { useState } from "react";
import { AdminView } from "@/src/components/guard-1279/AdminView";
import { PortalView } from "@/src/components/guard-1279/PortalView";

export default function Guard1279Page() {
  const [currentView, setCurrentView] = useState<"admin" | "portal">("admin");

  return (
    <div className="h-screen w-full overflow-hidden bg-white relative">
      {/* Full Screen View */}
      <div className="h-full w-full">
        {currentView === "admin" ? <AdminView /> : <PortalView />}
      </div>
      
      {/* Floating Toggle Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-full p-1 border border-gray-200 flex items-center gap-1 z-50">
        <button
          onClick={() => setCurrentView("admin")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            currentView === "admin" 
              ? "bg-blue-600 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Admin Settings
        </button>
        <button
          onClick={() => setCurrentView("portal")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            currentView === "portal" 
              ? "bg-blue-600 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Public Portal
        </button>
      </div>
    </div>
  );
}
