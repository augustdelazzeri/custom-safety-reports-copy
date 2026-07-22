"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Globe, 
  Settings, 
  Download, 
  Share2, 
  Printer, 
  MoreVertical,
  HardHat,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  QrCode,
  Mic,
  Upload,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AccessPointPublicView() {
  const params = useParams();
  const id = params.id;
  const [activeTab, setActiveTab] = useState<'capture' | 'documents'>('documents');
  const [eventDescription, setEventDescription] = useState("");
  
  // Document Viewing State
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [availableLanguages, setAvailableLanguages] = useState(["en"]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

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
      if (parsed.secondaryLanguages?.length > 0) {
        setAvailableLanguages(["en", ...parsed.secondaryLanguages]);
      } else {
        // Fallback for testing if nothing set
        setAvailableLanguages(["en", "es", "fr"]);
      }
    } else {
      setAvailableLanguages(["en", "es", "fr"]);
    }
  }, []);

  const documents = {
    sds: [
      { id: "sds-1", title: "ACID #8 1K ACID ETCH PRIMER BLACK AEROSOL", type: "U-POL US Inc" },
      { id: "sds-2", title: "ACID #8 1K ACID ETCH PRIMER GRAY AEROSOL", type: "U-POL US Inc" },
      { id: "sds-3", title: "S 0510-R90B BLUE POLYESTER", type: "PPC Industries, Inc." },
    ],
    loto: [
      { id: "loto-1", title: "LOTO: Conveyor Belt Maintenance", type: "Procedure" },
      { id: "loto-2", title: "LOTO: LOTO-CVS-304: Isolation of Conveyor 3", type: "Equipment" },
      { id: "loto-3", title: "LOTO: Conveyor Belt Maintenance - LOTO Procedure", type: "Procedure" },
    ]
  };

  const MOCK_DOC_CONTENT: Record<string, any> = {
    en: {
      title: "ACID #8 1K ACID ETCH PRIMER BLACK AEROSOL",
      company: "U-POL US Inc",
      updated: "Updated May 20, 2026",
      sections: [
        {
          title: "1. Identification",
          items: [
            { label: "Manufacturer", value: "U-POL US Inc" },
            { label: "CAS number", value: "Not provided" },
            { label: "Product code", value: "UP0837" }
          ]
        },
        {
          title: "2. Hazard Identification",
          signalWord: "Danger",
          badges: ["Flame", "Gas Cylinder", "Corrosion", "Exclamation Mark", "Health Hazard"],
          bullets: [
            "Extremely flammable aerosol.",
            "Contains gas under pressure; may explode if heated.",
            "Causes skin irritation.",
            "Causes serious eye damage.",
            "May cause drowsiness or dizziness.",
            "Suspected of causing cancer."
          ]
        },
        {
          title: "4. First-aid measures",
          items: [
            { label: "Eyes", value: "Rinse cautiously with water for several minutes. Remove contact lenses, if present and easy to do. Continue rinsing. Call a physician immediately." },
            { label: "Skin", value: "Wash skin with plenty of water. Take off contaminated clothing. If skin irritation occurs: Get medical advice/attention." },
            { label: "Inhalation", value: "Remove person to fresh air and keep comfortable for breathing." },
            { label: "Ingestion", value: "Call a poison center/doctor/physician if you feel unwell." }
          ]
        }
      ]
    },
    es: {
      title: "ACID #8 1K IMPRIMADOR AL ÁCIDO NEGRO AEROSOL",
      company: "U-POL US Inc",
      updated: "Actualizado 20 Mayo 2026",
      sections: [
        {
          title: "1. Identificación",
          items: [
            { label: "Fabricante", value: "U-POL US Inc" },
            { label: "Número CAS", value: "No proporcionado" },
            { label: "Código de producto", value: "UP0837" }
          ]
        },
        {
          title: "2. Identificación de Peligros",
          signalWord: "Peligro",
          badges: ["Llama", "Cilindro de Gas", "Corrosión", "Signo de Exclamación", "Peligro para la Salud"],
          bullets: [
            "Aerosol extremadamente inflamable.",
            "Contiene gas a presión; puede explotar si se calienta.",
            "Provoca irritación cutánea.",
            "Provoca lesiones oculares graves.",
            "Puede provocar somnolencia o vértigo.",
            "Sospechoso de provocar cáncer."
          ]
        },
        {
          title: "4. Medidas de primeros auxilios",
          items: [
            { label: "Ojos", value: "Enjuagar cuidadosamente con agua durante varios minutos. Quitar las lentes de contacto, si lleva y resulta fácil. Seguir enjuagando. Llamar inmediatamente a un médico." },
            { label: "Piel", value: "Lavar la piel con abundante agua. Quitar la ropa contaminada. En caso de irritación cutánea: Consultar a un médico." },
            { label: "Inhalación", value: "Transportar a la persona al aire libre y mantenerla en una posición que le facilite la respiración." },
            { label: "Ingestión", value: "Llamar a un centro de toxicología/médico si la persona se encuentra mal." }
          ]
        }
      ]
    }
  };

  const getDocContent = () => MOCK_DOC_CONTENT[currentLanguage] || MOCK_DOC_CONTENT.en;

  return (
    <div className="min-h-screen bg-[#f1f1f1] font-sans pb-12">
      {/* Header Tabs */}
      <div className="bg-white flex justify-center py-4 sticky top-0 z-10 shadow-sm">
        <div className="inline-flex rounded-md border border-gray-200">
          <button 
            onClick={() => setActiveTab('capture')}
            className={`px-4 py-1.5 text-sm font-medium rounded-l-md transition-colors ${activeTab === 'capture' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            Capture Event
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-1.5 text-sm font-medium rounded-r-md transition-colors border-l border-gray-200 ${activeTab === 'documents' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            View Documents
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto mt-8 bg-white min-h-[600px] shadow-sm rounded-lg p-10 relative">
        
        {/* Document Modal Overlay */}
        {selectedDoc && (
          <div className="absolute inset-0 bg-white z-20 rounded-lg overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="text-sm font-semibold text-gray-900">Document Viewer</div>
              </div>

              {/* H1 Multi-Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 shadow-sm"
                >
                  <Globe className="size-4 text-blue-600" />
                  <span>{LANGUAGE_LABELS[currentLanguage]}</span>
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
                
                {showLanguageMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowLanguageMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-20">
                      <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                        Select Language
                      </div>
                      {availableLanguages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => {
                            setCurrentLanguage(lang);
                            setShowLanguageMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                            currentLanguage === lang ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {LANGUAGE_LABELS[lang]}
                          {currentLanguage === lang && <CheckCircle2 className="size-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-10">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{getDocContent().title}</h1>
              <p className="text-sm text-gray-600 mb-1">{getDocContent().company}</p>
              <p className="text-xs text-gray-400 pb-6 border-b border-gray-100">{getDocContent().updated}</p>

              <div className="mt-8 space-y-10">
                {getDocContent().sections.map((sec: any, idx: number) => (
                  <div key={idx}>
                    <h2 className="text-base font-bold text-gray-900 mb-4">{sec.title}</h2>
                    
                    {sec.signalWord && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700 mr-2">Signal word:</span>
                        <span className="text-sm text-gray-900">{sec.signalWord}</span>
                      </div>
                    )}
                    
                    {sec.badges && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {sec.badges.map((b: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-700">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}

                    {sec.bullets && (
                      <ul className="list-disc pl-5 space-y-1.5 mb-4">
                        {sec.bullets.map((bullet: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {sec.items && (
                      <div className="space-y-3">
                        {sec.items.map((item: any, i: number) => (
                          <div key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                            <span className="text-sm font-bold text-gray-900 sm:w-32 shrink-0">{item.label}</span>
                            <span className="text-sm text-gray-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        {!selectedDoc && (
          <div className="animate-in fade-in duration-300">
            {activeTab === 'capture' ? (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Event</h1>
                <p className="text-sm text-gray-500 mb-6">Tell us what is happening and we'll guide you through the rest</p>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200 w-max mb-8">
                  <MapPin className="size-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">Zone 3 - South Pillar Safety Station</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-900">Describe your event <span className="text-red-500">*</span></label>
                      <button className="text-blue-600 text-xs font-semibold px-3 py-1 border border-blue-600 rounded hover:bg-blue-50">
                        Fill out form manually
                      </button>
                    </div>
                    <div className="relative border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <textarea 
                        className="w-full h-32 p-4 text-sm outline-none resize-none"
                        placeholder="Type or speak your description..."
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm hover:bg-blue-700">
                          <Mic className="size-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200">
                          <Upload className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-400">
                      Press Enter to submit, Shift+Enter for a new line<br/>
                      What happened? Where? When? Who was involved?
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">Upload Photos or Videos (optional)</label>
                    <p className="text-xs text-gray-500 mb-3">Upload supporting media or documentation to help clarify what happened.</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50">
                      <Upload className="size-8 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-900">Tap to take a photo or upload</span>
                      <span className="text-xs text-gray-500 mt-1">Up to 10 files - Max File Size: 20MB</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50">
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Zone 3 - South Pillar Safety Station</h1>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">Both</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
                  <MapPin className="size-4" />
                  Portland
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-3">SDS ({documents.sds.length})</h2>
                    <div className="space-y-2">
                      {documents.sds.map((doc, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setCurrentLanguage("en");
                          }}
                          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                        >
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1">{doc.title}</div>
                            <div className="text-xs text-gray-500">{doc.type}</div>
                          </div>
                          <ChevronDown className="size-5 text-gray-300 -rotate-90 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-3">LOTO ({documents.loto.length})</h2>
                    <div className="space-y-2">
                      {documents.loto.map((doc, i) => (
                        <button 
                          key={i}
                          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                        >
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1">{doc.title}</div>
                            <div className="text-xs text-gray-500">{doc.type}</div>
                          </div>
                          <ChevronDown className="size-5 text-gray-300 -rotate-90 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}