"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import SafetyEventFormRuntime from "../../../src/components/SafetyEventFormRuntime";

export default function NewSafetyEventPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
      
        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <SafetyEventFormRuntime />
        </main>
      </div>
    </div>
  );
}
