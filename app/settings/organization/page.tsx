"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import { Info, ExternalLink, Globe, Check, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

export default function OrganizationSettingsPage() {
  const [primaryLanguage, setPrimaryLanguage] = useState("en");
  const [secondaryLanguages, setSecondaryLanguages] = useState<string[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const LANGUAGE_LABELS: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
    de: "German"
  };

  const handleSave = () => {
    // Mock save to localStorage
    const settings = {
      primaryLanguage,
      secondaryLanguages,
      autoGenerate
    };
    localStorage.setItem('ehs_localization_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('ehs_localization_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPrimaryLanguage(parsed.primaryLanguage || "en");
      setSecondaryLanguages(parsed.secondaryLanguages || []);
      setAutoGenerate(parsed.autoGenerate || false);
    }
  }, []);

  const toggleSecondaryLanguage = (lang: string) => {
    if (lang === primaryLanguage) return;
    setSecondaryLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang) 
        : prev.length < 2 ? [...prev, lang] : prev
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64">
        {/* We use a custom header that looks like the screenshot */}
        <div className="bg-white">
          <div className="flex items-center text-sm text-gray-500 font-medium px-8 pt-4 pb-2">
            <span className="cursor-pointer hover:text-gray-900">Settings</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-semibold">Company Settings</span>
          </div>
          
          <div className="px-8 pb-4 pt-2">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your safety platform configuration.</p>
          </div>

          <div className="border-b border-gray-200 px-8">
            <nav className="-mb-px flex space-x-8">
              <Link href="/settings/safety-templates" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2">
                <SettingsIcon className="size-4" />
                Safety Templates
              </Link>
              <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">OSHA Locations</a>
              <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Hazards & Control Measures</a>
              <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-blue-600 text-blue-600">Company</a>
              <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">People & Permissions</a>
              <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Privacy</a>
            </nav>
          </div>
        </div>

        <main className="p-8 max-w-4xl">
          <div className="flex space-x-4 mb-6">
            <button className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 shadow-sm rounded-md flex items-center gap-2">
              <SettingsIcon className="size-3.5" />
              Organization
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">Regulatory Frameworks</button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">Report Types</button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">Custom AI Instructions</button>
          </div>

          <div className="space-y-6">
            {/* Synced Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">UpKeep Synced Information</h2>
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5 transition-colors">
                  Modify in CMMS
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Organization Name</label>
                  <input type="text" readOnly value="August" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Timezone</label>
                  <input type="text" readOnly value="America/Sao_Paulo" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Locale</label>
                  <input type="text" readOnly value="en-us" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Logo</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-400">
                    Not set
                  </div>
                </div>
                <div className="col-span-2 mt-2 flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <Info className="size-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600">
                    These fields are synced from UpKeep CMMS and cannot be modified here.
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Industry Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Location & Industry</h2>
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Country</label>
                  <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none">
                    <option>Select country...</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">State / Province</label>
                  <input type="text" placeholder="e.g., California, São Paulo" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none placeholder:text-gray-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">City</label>
                  <input type="text" placeholder="e.g., Los Angeles, New York" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none placeholder:text-gray-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">NAICS Code</label>
                  <input type="text" placeholder="e.g., 111110, 541710" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none placeholder:text-gray-400" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-700">Address</label>
                  <input type="text" placeholder="Street address" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none placeholder:text-gray-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Industry Type</label>
                  <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none">
                    <option>Select industry</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Primary Language</label>
                  <select 
                    value={primaryLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setPrimaryLanguage(newLang);
                      setSecondaryLanguages(prev => prev.filter(l => l !== newLang));
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 outline-none"
                  >
                    {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2 space-y-1 pt-2 border-t border-gray-100">
                  <label className="text-xs font-medium text-gray-700 flex items-center justify-between">
                    Secondary Languages
                    <span className="text-[10px] text-gray-400 font-normal">Optional multi-language generation</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <select 
                      onChange={(e) => {
                        const code = e.target.value;
                        if (code && code !== primaryLanguage) toggleSecondaryLanguage(code);
                        e.target.value = "";
                      }}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 outline-none"
                    >
                      <option value="">Add secondary language...</option>
                      {Object.entries(LANGUAGE_LABELS).filter(([code]) => code !== primaryLanguage && !secondaryLanguages.includes(code)).map(([code, label]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={autoGenerate}
                          onChange={() => setAutoGenerate(!autoGenerate)}
                        />
                        <div className={`block w-8 h-4.5 rounded-full transition-colors ${autoGenerate ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform transform ${autoGenerate ? 'translate-x-3.5' : ''}`}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Enable Automatic</span>
                    </label>
                  </div>
                  
                  {secondaryLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {secondaryLanguages.map(code => (
                        <span key={code} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                          {LANGUAGE_LABELS[code]}
                          <button onClick={() => toggleSecondaryLanguage(code)} className="text-blue-400 hover:text-blue-800">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 pb-8">
              <button 
                onClick={handleSave}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
                  isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="size-4" />
                    Settings Saved
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}