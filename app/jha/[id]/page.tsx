"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
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
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

export default function JhaDetailsPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [availableLanguages, setAvailableLanguages] = useState(["en"]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedLinkedItems, setExpandedLinkedItems] = useState(true);

  const LANGUAGE_LABELS: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
    de: "German"
  };

  const TRANSLATIONS: Record<string, any> = {
    en: {
      title: "Standard Handling and Preliminary Assessment of Industrial Electric Motors - Copy 2",
      hazards: "Identified Hazards",
      controls: "Control Measures",
      steps: [
        { title: "Pre-Job Planning and Work Area Preparation", desc: "Review all task requirements and clear the immediate area of unauthorized personnel.", risk: 4, riskLabel: "Low", hazards: ["Trip hazards"], controls: ["Housekeeping"] },
        { title: "Receiving and Initial Visual Inspection of Motor", desc: "Inspect motor for visible transit damage before touching internal components.", risk: 6, riskLabel: "Medium", hazards: ["Sharp edges"], controls: ["Gloves"] },
        { title: "Manual or Mechanical Handling and Positioning", desc: "Use proper lifting devices for motors over 50 lbs.", risk: 8, riskLabel: "Medium", hazards: ["Ergonomic strain", "Dropped load"], controls: ["Crane", "Steel-toe boots"] },
        { title: "Electrical Isolation and Verification", desc: "Verify energy isolation and apply locks", risk: 5, riskLabel: "Low", hazards: ["Electrical shock", "Sudden startup"], controls: ["LOTO procedure", "Voltage test"] },
        { title: "Preliminary Mechanical and Electrical Assessment", desc: "Check brushes, winding condition, and free rotation of the shaft.", risk: 11, riskLabel: "Medium", hazards: ["Pinch points", "Stored energy"], controls: ["Safe positioning", "Discharge capacitors"] },
        { title: "Documentation, Reporting, and Housekeeping", desc: "Record findings and clean the work area.", risk: 2, riskLabel: "Low", hazards: ["None"], controls: ["None"] }
      ]
    },
    es: {
      title: "Manipulación Estándar y Evaluación Preliminar de Motores Eléctricos Industriales - Copia 2",
      hazards: "Peligros Identificados",
      controls: "Medidas de Control",
      steps: [
        { title: "Planificación Previa al Trabajo y Preparación del Área", desc: "Revisar todos los requisitos de la tarea y despejar el área inmediata de personal no autorizado.", risk: 4, riskLabel: "Bajo", hazards: ["Peligros de tropiezo"], controls: ["Limpieza"] },
        { title: "Recepción e Inspección Visual Inicial del Motor", desc: "Inspeccionar el motor en busca de daños visibles por tránsito antes de tocar los componentes internos.", risk: 6, riskLabel: "Medio", hazards: ["Bordes afilados"], controls: ["Guantes"] },
        { title: "Manipulación y Posicionamiento Manual o Mecánico", desc: "Usar dispositivos de elevación adecuados para motores de más de 50 lbs.", risk: 8, riskLabel: "Medio", hazards: ["Tensión ergonómica", "Carga caída"], controls: ["Grúa", "Botas con punta de acero"] },
        { title: "Aislamiento Eléctrico y Verificación", desc: "Verificar el aislamiento de energía y aplicar candados", risk: 5, riskLabel: "Bajo", hazards: ["Choque eléctrico", "Arranque repentino"], controls: ["Procedimiento LOTO", "Prueba de voltaje"] },
        { title: "Evaluación Preliminar Mecánica y Eléctrica", desc: "Comprobar el estado de las escobillas, los devanados y la rotación libre del eje.", risk: 11, riskLabel: "Medio", hazards: ["Puntos de pellizco", "Energía almacenada"], controls: ["Posicionamiento seguro", "Descarga de capacitores"] },
        { title: "Documentación, Informes y Limpieza", desc: "Registrar hallazgos y limpiar el área de trabajo.", risk: 2, riskLabel: "Bajo", hazards: ["Ninguno"], controls: ["Ninguno"] }
      ]
    },
  };

  useEffect(() => {
    const saved = localStorage.getItem('ehs_localization_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAvailableLanguages(["en", ...parsed.secondaryLanguages]);
    } else {
      setAvailableLanguages(["en", "es"]);
    }
  }, []);

  const content = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const getRiskColor = (label: string) => {
    switch(label.toLowerCase()) {
      case 'low': case 'bajo': return 'text-green-600 bg-green-50';
      case 'medium': case 'medio': return 'text-orange-500 bg-orange-50';
      case 'high': case 'alto': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="ml-64">
        {/* Mock Header from Screenshot */}
        <div className="bg-white h-16 border-b border-gray-200 flex items-center px-8">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">Documentation</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-semibold">JHA Details</span>
          </div>
        </div>

        <main className="p-8 max-w-7xl mx-auto">
          {/* Breadcrumb & Actions */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm">
              <ArrowLeft className="size-4" />
              Back
            </button>
          </div>
          
          {/* Main Title Area */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1 mr-8">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {content.title}
                </h1>
                <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">Version 2.0</span>
                <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">JHA-0007-2.0</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Approved/Active
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[8px] font-bold">AD</div>
                  Owner: August Delazzeri
                </span>
                <span>•</span>
                <span>Approvers: August Delazzeri</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Last Reviewed: Jun 24, 2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Language Switcher (H1 Requirement) */}
              <div className="relative">
                <button 
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700 shadow-sm"
                >
                  <Globe className="size-4 text-blue-600" />
                  <span>{LANGUAGE_LABELS[currentLanguage]}</span>
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
                
                {showLanguageMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowLanguageMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
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

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-700 rounded-md hover:bg-blue-700 transition-all text-sm font-semibold shadow-sm">
                <Download className="size-4" />
                Generate PDF Report
              </button>
              
              <button className="p-2 bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                <MoreVertical className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content Area (Left) */}
            <div className="col-span-2 space-y-4">
              {/* Task Steps & Risk Assessment */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="size-4 text-gray-500" />
                    Task Steps & Risk Assessment
                  </h2>
                  <ChevronUp className="size-4 text-gray-400" />
                </div>
                
                <div className="p-2">
                  <div className="space-y-1">
                    {content.steps.map((step: any, idx: number) => {
                      const isExpanded = expandedStep === idx;
                      return (
                        <div key={idx} className={`rounded-lg border transition-all ${isExpanded ? 'border-blue-200 bg-blue-50/30' : 'border-transparent hover:bg-gray-50'}`}>
                          <div 
                            onClick={() => setExpandedStep(isExpanded ? null : idx)}
                            className="flex items-center justify-between p-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                                <p className="text-xs text-gray-500">Step {idx + 1} of {content.steps.length}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getRiskColor(step.riskLabel)}`}>
                                  Risk: {step.risk}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getRiskColor(step.riskLabel)}`}>
                                  {step.riskLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Content (Simulated) */}
                          {isExpanded && (
                            <div className="px-16 pb-4 pt-0">
                              <p className="text-sm text-gray-700 mb-4">{step.desc}</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white border border-gray-200 rounded-md">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{content.hazards}</p>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {step.hazards.map((h: string, i: number) => <li key={i} className="text-xs text-gray-800">{h}</li>)}
                                  </ul>
                                </div>
                                <div className="p-3 bg-white border border-gray-200 rounded-md">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{content.controls}</p>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {step.controls.map((c: string, i: number) => <li key={i} className="text-xs text-gray-800">{c}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Linked Items */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div 
                  onClick={() => setExpandedLinkedItems(!expandedLinkedItems)}
                  className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <LinkIcon className="size-4 text-gray-500" />
                    Linked Items
                  </h2>
                  {expandedLinkedItems ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
                </div>
                
                {expandedLinkedItems && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900">Checklist Templates</h3>
                      <div className="flex items-center gap-3">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Create Template</button>
                        <button className="text-xs text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1 border border-gray-200 px-2 py-1 rounded">
                          <Plus className="size-3" /> Link to existing template
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">JHA Safety Checklist - Standard Handling and Preliminary Assessment of Industrial Electric Motors</h4>
                        <p className="text-xs text-gray-500 mt-1">Job Hazard Analysis checklist for safe handling, electrical isolation, inspection, and preliminary assessment of industrial electric motors in accordance with Canadian safety regulations.</p>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600"><MoreVertical className="size-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (Right) */}
            <div className="space-y-4">
              {/* Risk Summary */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="size-4 text-gray-500" />
                  Risk Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Initial Risk Score</p>
                    <p className="text-2xl font-bold text-gray-900">16</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Residual Risk Score</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Task Steps</p>
                  <p className="text-sm font-bold text-gray-900">6 steps</p>
                </div>
              </div>

              {/* Approval Workflow */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Approval Workflow</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded flex items-center gap-1">
                    <MoreVertical className="size-3" /> Parallel
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-2">1 of 1 approved</p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mb-4">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded border border-green-100">
                  <span className="text-sm font-medium text-gray-900">August Delazzeri</span>
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
              </div>

              {/* Location and Assets */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Location and Assets</h3>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="size-4 text-gray-400" />
                  New York
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Activity</h3>
                  <ChevronDown className="size-4 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1"><Clock className="size-4 text-yellow-500" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">In Review</p>
                      <p className="text-xs text-gray-500">Jun 24, 2026 11:42 AM</p>
                      <p className="text-xs text-gray-500">August Delazzeri</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1"><CheckCircle2 className="size-4 text-green-500" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Approved</p>
                      <p className="text-xs text-gray-500">Jun 24, 2026 11:42 AM</p>
                      <p className="text-xs text-gray-500">August Delazzeri</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}