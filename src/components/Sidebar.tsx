"use client";

/** 
 * WARNING: This component is a dependency for GUARD-1298 and GUARD-1279 prototypes.
 * Verify any changes against these routes.
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "../contexts/ProfileContext";
import { 
  AlertTriangle, 
  Building2, 
  Calendar, 
  CalendarDays, 
  ChevronUp, 
  Clipboard, 
  ClipboardCheck, 
  ClipboardList, 
  CreditCard, 
  FileBarChart, 
  FlaskConical, 
  HardHat, 
  LayoutDashboard, 
  LayoutGrid, 
  Lock, 
  MessagesSquare, 
  QrCode, 
  Settings, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const { currentProfile } = useProfile();
  
  const toggleSection = (id: string) => {
    setCollapsedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isSectionOpen = (id: string) => !collapsedSections.includes(id);

  const baseNavItems = [
    { id: "safety-management", label: "SAFETY MANAGEMENT", items: [
      { label: "Dashboard", icon: <LayoutDashboard className="size-5" />, href: "/" },
      { label: "Access Points", icon: <QrCode className="size-5" />, href: "/access-points" },
      { label: "Safety Events", icon: <AlertTriangle className="size-5" />, href: "/events" },
      { label: "CAPAs", icon: <ClipboardCheck className="size-5" />, href: "/capas" },
    ]},
    { id: "osha", label: "OSHA", items: [
      { label: "OSHA Log (Form 300)", icon: <FileBarChart className="size-5" />, href: "/osha/logs" },
      { label: "Summary (Form 300A)", icon: <Calendar className="size-5" />, href: "/osha/summary" },
      { label: "Agency Reports", icon: <Building2 className="size-5" />, href: "#" },
    ]},
    { id: "documentation", label: "DOCUMENTATION", items: [
      { label: "Job Hazard Analyses", icon: <HardHat className="size-5" />, href: "/jhas" },
      { label: "Standard Operating Procedures", icon: <ClipboardList className="size-5" />, href: "/sops" },
      { label: "Lockout/Tagout", icon: <Lock className="size-5" />, href: "/lotos" },
      { label: "Permit to Work", icon: <FileBarChart className="size-5" />, href: "/ptws" },
      { label: "Audits & Inspections", icon: <Clipboard className="size-5" />, href: "/audits" },
      { label: "SDS Library", icon: <FlaskConical className="size-5" />, href: "/sds" },
    ]},
    { id: "safety-actions", label: "SAFETY ACTIONS", items: [
      { label: "Safety Work Orders", icon: <ClipboardCheck className="size-5" />, href: "/safety-work-orders" },
    ]},
  ];

  const navItems = baseNavItems;
  
  const currentApp = "ehs" as "cmms" | "ehs";

  const closeAllPopups = () => {
    setShowAppSwitcher(false);
    setShowSettingsMenu(false);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-30 shadow-sm">
      {/* Logo and User */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <ShieldCheck className="text-white size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-tight">UpKeep Safety</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">EHS Platform</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
            <span className="text-gray-600 font-bold text-xs">JG</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((section) => (
          <div key={section.id} className="mb-2">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] hover:text-gray-600 transition-colors"
            >
              {section.label}
              {isSectionOpen(section.id) ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
            
            {isSectionOpen(section.id) && (
              <nav className="px-3 space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer — Icon toolbar */}
      <div className="border-t border-gray-200 px-3 py-3 bg-gray-50/30">
        <div className="flex items-center justify-between">
          {/* App switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowAppSwitcher(!showAppSwitcher); setShowSettingsMenu(false); }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer ${
                showAppSwitcher 
                  ? "bg-white border-blue-200 text-blue-600 shadow-md" 
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 shadow-sm"
              }`}
            >
              <LayoutGrid className="size-5" />
            </button>

            {showAppSwitcher && (
              <>
                <div className="fixed inset-0 z-10" onClick={closeAllPopups} />
                <div className="absolute bottom-12 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-20 w-48 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700">
                      <Settings className="size-4 text-red-500" />
                      <span className="text-sm font-medium">Maintenance</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 cursor-pointer text-blue-700">
                      <ShieldCheck className="size-4 text-red-500" />
                      <span className="text-sm font-medium">Safety</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-red-500">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                      <span className="text-sm font-medium">Learn</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm transition-all duration-200">
              <MessagesSquare className="size-4" />
            </button>
            
            <Link
              href="/settings/subscription"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
                pathname === "/settings/subscription"
                  ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                  : "text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm"
              }`}
            >
              <CreditCard className="size-4" />
            </Link>

            <div className="relative">
              <Link
                href="/settings/people"
                onClick={() => { setShowAppSwitcher(false); }}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                  pathname.startsWith("/settings") && pathname !== "/settings/subscription"
                    ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                    : "text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm"
                }`}
              >
                <Settings className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
