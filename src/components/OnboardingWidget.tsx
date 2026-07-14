"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOnboarding } from "../hooks/useOnboarding";

export default function OnboardingWidget() {
  const { isOpen, completedSteps, isLoaded, toggleOpen, setStepComplete, style } = useOnboarding();
  const [isMounted, setIsMounted] = useState(false);
  const [showJHAModal, setShowJHAModal] = useState(false);
  const [jhaName, setJhaName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoaded || style !== 'floating_checklist' || pathname?.startsWith('/GUARD-1275')) return null;

  const handleCreateJHA = (e: React.FormEvent) => {
    e.preventDefault();
    if (jhaName.trim()) {
      setStepComplete(2);
      setShowJHAModal(false);
      setJhaName("");
    }
  };

  const completedCount = completedSteps.filter(Boolean).length;
  const totalSteps = completedSteps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const steps = [
    {
      title: "Invite your team",
      description: "So they can report incidents",
      href: "/settings/people",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Create Access Point",
      description: "Generate a QR for the floor",
      href: "/access-points",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      title: "Add a document",
      description: "Upload an SOP, JHA, or LOTO",
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setShowJHAModal(true);
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer z-50"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
          {completedCount}/{totalSteps}
        </div>
        <span className="text-sm font-semibold text-gray-900">Set up Safety</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Set up Safety</h3>
          <p className="text-xs text-gray-500">{completedCount} of {totalSteps} complete</p>
        </div>
        <button
          onClick={toggleOpen}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="p-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps[index];
          return (
            <Link
              key={step.title}
              href={step.href}
              onClick={step.onClick}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className={`mt-0.5 p-2 rounded-lg transition-colors ${
                isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
              }`}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.icon}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {!isCompleted && (
                <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>

      {/* JHA Modal */}
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
  );
}
