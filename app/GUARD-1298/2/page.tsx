"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/src/components/Sidebar";
import Header from "@/src/components/Header";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Sparkles, 
  Mic, 
  Upload, 
  Plus, 
  ChevronDown, 
  Info, 
  Globe,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Paperclip,
  ArrowUp
} from "lucide-react";

export default function NewJhaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [orgSettings, setOrgSettings] = useState<any>({ secondaryLanguages: [], autoGenerate: false });
  const [jhaData, setJhaData] = useState({
    title: "",
    location: "",
    description: "",
    referenceId: ""
  });

  const LANGUAGE_LABELS: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
    de: "German"
  };

  useEffect(() => {
    const saved = localStorage.getItem('ehs_localization_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrgSettings(parsed);
      if (parsed.autoGenerate && parsed.secondaryLanguages.length > 0) {
        setSelectedLanguages(prev => Array.from(new Set([...prev, ...parsed.secondaryLanguages])));
      }
    }
  }, []);

  const toggleLanguage = (code: string) => {
    if (code === "en") return;
    setSelectedLanguages(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleGenerate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 2000);
  };

  const renderLanguageSelector = () => (
    <div className="space-y-4 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Output Languages</h3>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">Multi-Language AI</span>
      </div>
      <p className="text-xs text-gray-500">The AI will generate the full Job Hazard Analysis in each selected language.</p>
      
      <div className="flex flex-wrap gap-2">
        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 font-medium flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          {LANGUAGE_LABELS.en} (Primary)
        </div>
        
        {orgSettings.secondaryLanguages?.map((code: string) => (
          <button
            key={code}
            onClick={() => toggleLanguage(code)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 border ${
              selectedLanguages.includes(code)
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {selectedLanguages.includes(code) ? <CheckCircle2 className="size-4" /> : <div className="size-4 rounded-full border border-gray-300" />}
            {LANGUAGE_LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="ml-64">
        {/* Mock Header from Screenshot */}
        <div className="bg-white h-16 border-b border-gray-200 flex items-center px-8">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">Documentation</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-semibold">Create JHA</span>
          </div>
        </div>

        <main className="p-8 max-w-4xl mx-auto">
          {step === 1 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Basic Information Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-1">
                  Basic Information <span className="text-red-500">*</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Provide the basic details about this Job Hazard Analysis.</p>
                
                {/* We can hide the title/id inputs to make it look exactly like the screenshot, 
                    or we can keep them inside the basic info block. Let's keep them hidden to match the visual for the "AI generation" step. */}
              </div>

              {/* Describe your JHA Section */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Describe your JHA</h2>
                  <button className="px-4 py-1.5 border border-blue-600 text-blue-600 text-sm font-semibold rounded-md hover:bg-blue-50 transition-colors">
                    Fill manually
                  </button>
                </div>

                <div className="relative border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <textarea 
                    className="w-full h-32 p-4 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none"
                    placeholder="Type or speak your description, or attach a document..."
                    value={jhaData.description}
                    onChange={(e) => setJhaData({...jhaData, description: e.target.value})}
                  />
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                      <Paperclip className="size-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm">
                      <Mic className="size-4" />
                    </button>
                    <button 
                      onClick={handleGenerate}
                      disabled={isProcessing || !jhaData.description}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="size-4 animate-spin text-blue-600" /> : <ArrowUp className="size-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Press Enter to submit, Shift+Enter for a new line</p>
                
                {renderLanguageSelector()}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 mb-8">
                <CheckCircle2 className="size-6 text-green-600" />
                <div>
                  <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider">Generation Complete</h3>
                  <p className="text-xs text-green-700">JHA generated in {selectedLanguages.length} {selectedLanguages.length > 1 ? 'languages' : 'language'}.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">JHA: Maintenance Task</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">Draft</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Analysis Results</h3>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">{i}</div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-100 rounded w-full"></div>
                          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 rounded-md border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Back to Edit
                    </button>
                    <button 
                      onClick={() => router.push('/jha/123')}
                      className="px-8 py-2.5 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 shadow-sm"
                    >
                      Save & View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}