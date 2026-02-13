"use client";

import React, { useState } from "react";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import Link from "next/link";

type BillingPeriod = "annual" | "monthly";

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
  const [seats, setSeats] = useState(3);

  const pricePerSeat = billingPeriod === "annual" ? 1800 : 150;
  const priceLabel = billingPeriod === "annual" ? "/ seat / year" : "/ seat / month";
  const totalPrice = pricePerSeat * seats;
  const totalLabel = billingPeriod === "annual" ? "/ year" : "/ month";

  const handleSeatsChange = (delta: number) => {
    setSeats((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title="Subscription" />

        <main className="p-8 max-w-5xl mx-auto">
          {/* Single unified card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Top bar — subtle */}
            <div className="bg-gray-800 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">UpKeep EHS Essential</h2>
                  <p className="text-gray-400 text-xs">You only pay for users with paid permissions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Billing Toggle */}
                <div className="flex items-center bg-white/10 rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setBillingPeriod("annual")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      billingPeriod === "annual"
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      billingPeriod === "monthly"
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">${pricePerSeat.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs ml-1">{priceLabel}</span>
                </div>
              </div>
            </div>

            {/* Content: two columns inside one card */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Left — Free permissions */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">Free for all users</h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <span><strong className="text-gray-800">View</strong> — read-only access to all modules</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <span><strong className="text-gray-800">Create &amp; edit own Safety Events</strong> — report and edit your own incidents</span>
                  </li>
                </ul>

                <p className="text-xs text-gray-400 mt-4">
                  Includes system roles <strong>View-Only</strong> and <strong>Technician</strong>.
                </p>
              </div>

              {/* Right — Paid permissions */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">Paid per seat</h3>
                  <span className="text-xs text-gray-400 ml-auto">any of these = billed user</span>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong className="text-gray-800">Create &amp; Edit</strong> — create, edit, or duplicate others&apos; records</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong className="text-gray-800">Approvals</strong> — approve, reject, or submit workflows</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong className="text-gray-800">Archive &amp; Delete</strong> — archive or delete records</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong className="text-gray-800">Reporting</strong> — export data and generate reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom — Seat management */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                {/* Seat counter */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Paid seats</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleSeatsChange(-1)}
                      disabled={seats <= 1}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-r border-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-5 py-2 text-sm font-semibold text-gray-900 min-w-[3rem] text-center bg-white">
                      {seats}
                    </span>
                    <button
                      onClick={() => handleSeatsChange(1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border-l border-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Total + action */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${totalPrice.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500 ml-1">{totalLabel}</span>
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                    Update seats
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Only users whose role includes paid permissions count as a seat.{" "}
                <Link href="/settings/people" className="text-blue-600 hover:underline">
                  Manage roles &rarr;
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
