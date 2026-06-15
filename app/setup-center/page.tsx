"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../src/components/Sidebar";
import Header from "../../src/components/Header";
import { useOnboarding } from "../../src/hooks/useOnboarding";
import Link from "next/link";

export default function SetupCenterPage() {
  const { completedSteps, isLoaded, setStepComplete } = useOnboarding();
  const [isMounted, setIsMounted] = useState(false);
  const [showJHAModal, setShowJHAModal] = useState(false);
  const [jhaName, setJhaName] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoaded) return null;

  const completedCount = completedSteps.filter(Boolean).length;
  const totalSteps = completedSteps.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  const handleCreateJHA = (e: React.FormEvent) => {
    e.preventDefault();
    if (jhaName.trim()) {
      setStepComplete(2);
      setShowJHAModal(false);
      setJhaName("");
    }
  };

  const phases = [
    {
      id: 1,
      title: "Phase 1",
      subtitle: "Safety Foundation",
      status: "Build the Foundation",
      steps: [
        {
          id: 0,
          title: "Invite your team",
          description: "Invite your core team and assign roles so the right people can manage safety events.",
          href: "/settings/people",
          duration: "5 min",
          icon: (
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          ),
        },
        {
          id: 1,
          title: "Create Access Point",
          description: "Generate a QR code for the floor so technicians can report incidents instantly.",
          href: "/access-points",
          duration: "5 min",
          icon: (
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
          ),
        },
        {
          id: 2,
          title: "Add a document",
          description: "Upload an SOP, JHA, or LOTO to ensure compliance and safety standard awareness.",
          href: "#",
          onClick: () => setShowJHAModal(true),
          duration: "5 min",
          icon: (
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          ),
        },
      ]
    },
    {
      id: 2,
      title: "Phase 2",
      subtitle: "Advanced Reporting",
      status: "Reduce Risk",
      steps: []
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        
        <main className="p-12 max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Safety Setup Center</h1>
              <p className="text-gray-500 text-lg">Build a strong safety operation and move from reactive reporting to preventive risk management.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Left Column: Phases */}
            <div className="col-span-2 space-y-6">
              {phases.map((phase) => (
                <div key={phase.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">{phase.id}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{phase.title}</h3>
                        <p className="text-xs text-gray-500">{phase.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-600">{phase.status}</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {phase.steps.length > 0 ? phase.steps.map((step) => {
                      const isCompleted = completedSteps[step.id];
                      return (
                        <div key={step.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors group relative">
                          {step.icon}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>{step.title}</h4>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 pr-12">{step.description}</p>
                            <Link 
                              href={step.href} 
                              onClick={step.onClick}
                              className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              Get Started
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-400">{step.duration}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isCompleted ? "bg-green-500 border-green-500 text-white" : "border-gray-200"
                            }`}>
                              {isCompleted && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-12 text-center text-gray-400 text-sm italic">
                        Complete Phase 1 to unlock advanced features.
                      </div>
                    )}
                  </div>
                  
                  {phase.steps.length > 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                      <span>{phase.steps.length} required steps</span>
                      <span>~15 min</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column: Progress & Help */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Your Progress</h3>
                <p className="text-sm text-gray-500 mb-6">{totalSteps - completedCount} steps left to complete your safety foundation</p>
                
                <div className="h-2 w-full bg-gray-100 rounded-full mb-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold mb-8">
                  <span className="text-blue-600">{progressPercentage}%</span>
                  <span className="text-gray-400">{completedCount}/{totalSteps} Steps</span>
                </div>

                <button className="w-full py-3 px-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors font-bold text-sm text-gray-900">
                  Start with safety reporting
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h4 className="font-bold text-blue-900 mb-2">Join our New User Program</h4>
                <p className="text-xs text-blue-700 mb-4 leading-relaxed">Free live onboarding sessions led by UpKeep EHS experts.</p>
                <button className="bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Register Now
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visit the Help Center</h4>
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-blue-600 hover:underline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Check the documentation
                </a>
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-blue-600 hover:underline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contact support
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* JHA Modal (duplicated logic for consistency) */}
        {showJHAModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Create Job Hazard Analysis (JHA)</h3>
                <button onClick={() => setShowJHAModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateJHA} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={jhaName}
                    onChange={(e) => setJhaName(e.target.value)}
                    placeholder="e.g., Roof Inspection Safety Plan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowJHAModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!jhaName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
