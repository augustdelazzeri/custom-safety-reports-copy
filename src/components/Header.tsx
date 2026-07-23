"use client";

/** 
 * WARNING: This component is a dependency for GUARD-1298 and GUARD-1279 prototypes.
 * Verify any changes against these routes.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "../contexts/ProfileContext";
import { useOnboarding, OnboardingStyle } from "../hooks/useOnboarding";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { currentProfile, switchProfile, profileName } = useProfile();
  const { resetOnboarding, style, setOnboardingStyle } = useOnboarding();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const handleProfileSwitch = (profile: 'global_admin' | 'technician') => {
    switchProfile(profile);
    setShowProfileMenu(false);
  };

  const handleStyleSwitch = (newStyle: OnboardingStyle) => {
    setOnboardingStyle(newStyle);
    setShowStyleMenu(false);
    
    // Navigate based on selected style
    if (newStyle === 'setup_center') {
      router.push('/setup-center');
    } else {
      router.push('/');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {title && (
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      )}
      <div className={`flex items-center gap-4 ${!title ? "ml-auto" : ""}`}>
        {/* Onboarding Style Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors text-sm font-medium text-gray-700"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>
              {style === 'floating_checklist' && "Floating Checklist + tips"}
              {style === 'setup_center' && "Setup Center"}
              {style === 'sample_data' && "Sample Data"}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStyleMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStyleMenu(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200 py-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase">Onboarding Experience</p>
                </div>
                {[
                  { id: 'floating_checklist', label: 'Floating Checklist + tips' },
                  { id: 'setup_center', label: 'Setup Center' },
                  { id: 'sample_data', label: 'Sample Data' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStyleSwitch(option.id as OnboardingStyle)}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                      style === option.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                    {style === option.id && (
                      <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sample Data Controls */}
        {style === 'sample_data' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Clear existing data first
                localStorage.removeItem('ehs_users');
                localStorage.removeItem('accessPoints');
                localStorage.removeItem('ehs_teams');
                localStorage.removeItem('ehs_custom_roles');
                localStorage.removeItem('capas');
                localStorage.removeItem('safetyEvents');
                
                // Explicitly set sample data
                // Import sample data here or use the mock data directly
                // Since we can't easily import in an inline event handler, 
                // we'll rely on the fact that we can just set the keys.
                
                // For users, we need to convert the array to a map
                const usersMap: any = {};
                const { mockUsers } = require("../samples/mockUsers");
                mockUsers.forEach((u: any) => usersMap[u.id] = u);
                localStorage.setItem('ehs_users', JSON.stringify(usersMap));
                
                // For teams
                const teamsMap: any = {};
                const { mockTeams } = require("../samples/mockTeams");
                mockTeams.forEach((t: any) => teamsMap[t.id] = t);
                localStorage.setItem('ehs_teams', JSON.stringify(teamsMap));
                
                // For Access Points
                // We'll use a simplified version of createDefaultAccessPoints
                const accessPoints = [
                  {
                    id: "access-point-1",
                    name: "[Sample] Production Line 3 QR",
                    location: {
                      selectedLevel: 4,
                      locationId: "loc_chicago",
                      locationName: "Chicago Plant",
                      fullPath: "Global Operations > North America > United States > Chicago Plant",
                      parentIds: ["loc_global", "loc_na", "loc_usa"],
                    },
                    templateIds: ["injury-report"],
                    createdBy: "Joty Grewal",
                    createdAt: new Date().toISOString(),
                    status: "active",
                    qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-1&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant"
                  },
                  {
                    id: "access-point-2",
                    name: "[Sample] Main Warehouse Entrance",
                    location: {
                      selectedLevel: 5,
                      locationId: "loc_chicago_prod",
                      locationName: "Production",
                      fullPath: "Global Operations > North America > United States > Chicago Plant > Production",
                      parentIds: ["loc_global", "loc_na", "loc_usa", "loc_chicago"],
                    },
                    templateIds: ["near-miss"],
                    createdBy: "Joty Grewal",
                    createdAt: new Date().toISOString(),
                    status: "active",
                    qrCodeUrl: "/safety-events/template-form?templateId=near-miss&accessPointId=access-point-2&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant%20%3E%20Production"
                  },
                  {
                    id: "access-point-3",
                    name: "[Sample] Chemical Storage Area",
                    location: {
                      selectedLevel: 4,
                      locationId: "loc_berlin",
                      locationName: "Berlin Factory",
                      fullPath: "Global Operations > Europe > Germany > Berlin Factory",
                      parentIds: ["loc_global", "loc_eu", "loc_germany"],
                    },
                    templateIds: ["injury-report"],
                    createdBy: "Joty Grewal",
                    createdAt: new Date().toISOString(),
                    status: "active",
                    qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-3&location=Global%20Operations%20%3E%20Europe%20%3E%20Germany%20%3E%20Berlin%20Factory"
                  }
                ];
                localStorage.setItem('accessPoints', JSON.stringify(accessPoints));
                
                // For CAPAs
                const capas = [
                  {
                    id: "CAPA-0001",
                    title: "[Sample] Repair Leaking Air Conditioning Unit",
                    type: "corrective",
                    status: "open",
                    priority: "high",
                    location: {
                      selectedLevel: 4,
                      locationId: "loc_chicago",
                      locationName: "Chicago Plant",
                      fullPath: "Global Operations > North America > United States > Chicago Plant",
                      parentIds: ["loc_global", "loc_na", "loc_usa"],
                    },
                    rcaMethod: "5 Whys",
                    rcaFindings: "1) Why did someone slip? Because there was water on the floor...",
                    rootCauseCategories: ["Equipment Failure", "Procedural"],
                    proposedActions: "1. Clean and dry the affected area immediately...",
                    ownerId: "user_003",
                    ownerName: "Jennifer Chen",
                    dueDate: "2026-06-20",
                    tags: ["Hazard", "Equipment"],
                    teamMembersToNotify: [],
                    createdDate: new Date().toISOString(),
                    createdBy: "user_003",
                    updatedDate: new Date().toISOString(),
                  },
                  {
                    id: "CAPA-0002",
                    title: "[Sample] Install Safety Guard on Mixer 2",
                    type: "preventive",
                    status: "in-review",
                    priority: "medium",
                    location: {
                      selectedLevel: 6,
                      locationId: "loc_berlin_manufacturing_floor1",
                      locationName: "Floor 1",
                      fullPath: "Global Operations > Europe > Germany > Berlin Factory > Manufacturing > Floor 1",
                      parentIds: ["loc_global", "loc_eu", "loc_germany", "loc_berlin", "loc_berlin_manufacturing"],
                    },
                    rcaMethod: "Fishbone Diagram",
                    rcaFindings: "Potential for hand injury during cleaning process...",
                    rootCauseCategories: ["Equipment Design"],
                    proposedActions: "Design and install a more robust interlocking safety guard...",
                    ownerId: "user_004",
                    ownerName: "Marcus Schmidt",
                    dueDate: "2026-06-25",
                    tags: ["Equipment", "Preventive"],
                    teamMembersToNotify: [],
                    createdDate: new Date().toISOString(),
                    createdBy: "user_004",
                    updatedDate: new Date().toISOString(),
                  },
                  {
                    id: "CAPA-0003",
                    title: "[Sample] Update Forklift Training SOP",
                    type: "both",
                    status: "closed",
                    priority: "low",
                    location: {
                      selectedLevel: 5,
                      locationId: "loc_austin_qa",
                      locationName: "Quality Assurance",
                      fullPath: "Global Operations > North America > United States > Austin Facility > Quality Assurance",
                      parentIds: ["loc_global", "loc_na", "loc_usa", "loc_austin"],
                    },
                    rcaMethod: "Direct Observation",
                    rcaFindings: "Recent near-miss incident revealed that operators were not following speed limits...",
                    rootCauseCategories: ["Training", "Procedural"],
                    proposedActions: "Update the SOP to include specific speed limits...",
                    ownerId: "user_005",
                    ownerName: "Sarah Austin",
                    dueDate: "2026-06-18",
                    tags: ["Training", "Procedure"],
                    teamMembersToNotify: [],
                    createdDate: new Date().toISOString(),
                    createdBy: "user_005",
                    updatedDate: new Date().toISOString(),
                  }
                ];
                localStorage.setItem('capas', JSON.stringify(capas));
                
                // For Safety Events
                const safetyEvents = [
                  { 
                    id: "SE-0001", 
                    title: "[Sample] Slip and Fall in Production Line 3", 
                    type: "Incident", 
                    status: "Open", 
                    severity: "Medium", 
                    location: "Chicago Plant > Production > Line 3", 
                    dateTime: "Jun 10, 2026 10:30 AM", 
                    osha: "No" 
                  },
                  { 
                    id: "SE-0002", 
                    title: "[Sample] Unsecured Chemical Container", 
                    type: "Observation", 
                    status: "In Review", 
                    severity: "Low", 
                    location: "Berlin Factory > Storage", 
                    dateTime: "Jun 11, 2026 2:15 PM", 
                    osha: "No" 
                  },
                  { 
                    id: "SE-0003", 
                    title: "[Sample] Forklift Near Miss in Warehouse", 
                    type: "Near Miss", 
                    status: "Closed", 
                    severity: "High", 
                    location: "Austin Facility > Warehouse", 
                    dateTime: "Jun 12, 2026 9:00 AM", 
                    osha: "Yes" 
                  }
                ];
                localStorage.setItem('safetyEvents', JSON.stringify(safetyEvents));
                
                // Preserve onboarding style but reset progress
                const onboardingStr = localStorage.getItem('upkeep_ehs_onboarding');
                if (onboardingStr) {
                  const onboarding = JSON.parse(onboardingStr);
                  onboarding.completedSteps = [false, false, false];
                  localStorage.setItem('upkeep_ehs_onboarding', JSON.stringify(onboarding));
                }
                
                window.location.reload();
              }}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              Load Sample Data
            </button>
            <button
              onClick={() => {
                localStorage.setItem('ehs_users', '{}');
                localStorage.setItem('accessPoints', '[]');
                localStorage.setItem('ehs_teams', '{}');
                localStorage.setItem('capas', '[]');
                localStorage.setItem('safetyEvents', '[]');
                localStorage.removeItem('ehs_custom_roles');
                
                // Preserve onboarding style
                const onboardingStr = localStorage.getItem('upkeep_ehs_onboarding');
                if (onboardingStr) {
                  const onboarding = JSON.parse(onboardingStr);
                  localStorage.setItem('upkeep_ehs_onboarding', JSON.stringify(onboarding));
                }
                
                window.location.reload();
              }}
              className="px-3 py-2 rounded-md bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Clear All Data
            </button>
          </div>
        )}

        {/* Reset Onboarding */}
        <button
          onClick={() => {
            // Clear application data
            localStorage.setItem('ehs_users', '{}');
            localStorage.setItem('accessPoints', '[]');
            localStorage.setItem('ehs_teams', '{}');
            localStorage.setItem('capas', '[]');
            localStorage.setItem('safetyEvents', '[]');
            localStorage.removeItem('ehs_custom_roles');
            
            // Reset onboarding progress but keep current style
            resetOnboarding();
            
            // Reload to apply data changes
            window.location.reload();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 cursor-pointer transition-all text-sm font-medium"
          title="Reset Onboarding Progress & Data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Onboarding
        </button>

        {/* Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">{profileName}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200 py-1">
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase">Switch Profile</p>
                </div>
                
                <button
                  onClick={() => handleProfileSwitch('global_admin')}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    currentProfile === 'global_admin'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <div>Global Admin</div>
                    <div className="text-xs text-gray-500">Full system access</div>
                  </div>
                  {currentProfile === 'global_admin' && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => handleProfileSwitch('technician')}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    currentProfile === 'technician'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div>Technician</div>
                    <div className="text-xs text-gray-500">Limited permissions</div>
                  </div>
                  {currentProfile === 'technician' && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </button>
        </div>
        
        {/* Create Button */}
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create
        </button>
      </div>
    </header>
  );
}

