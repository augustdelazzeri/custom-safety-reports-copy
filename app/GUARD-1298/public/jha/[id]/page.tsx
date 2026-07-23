"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  HardHat,
  Info
} from "lucide-react";
import Link from "next/link";

export default function PublicJhaViewerPage() {
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

  const TRANSLATIONS: Record<string, any> = {
    en: {
      header: "Job Hazard Analysis",
      description: "Review this document before starting work",
      title: "Electrical Maintenance - Production Line 3",
      hazards: "Hazards",
      controls: "Controls",
      steps: [
        { title: "Isolation & LOTO", desc: "Verify energy isolation and apply locks", hazards: ["Electrical shock", "Sudden startup"], controls: ["LOTO procedure", "Voltage test"] },
        { title: "Equipment Disassembly", desc: "Remove protective covers and internal parts", hazards: ["Sharp edges", "Stored energy"], controls: ["Cut-resistant gloves", "Discharge capacitors"] },
        { title: "Motor Inspection", desc: "Check brushes and winding condition", hazards: ["Dust inhalation", "Pinch points"], controls: ["N95 mask", "Safe positioning"] }
      ]
    },
    es: {
      header: "Análisis de Seguridad en el Trabajo",
      description: "Revise este documento antes de comenzar a trabajar",
      title: "Mantenimiento Eléctrico - Línea de Producción 3",
      hazards: "Peligros",
      controls: "Controles",
      steps: [
        { title: "Aislamiento y LOTO", desc: "Verificar el aislamiento de energía y aplicar candados", hazards: ["Choque eléctrico", "Arranque repentino"], controls: ["Procedimiento LOTO", "Prueba de voltaje"] },
        { title: "Desmontaje del Equipo", desc: "Retirar cubiertas protectoras y piezas internas", hazards: ["Bordes afilados", "Energía almacenada"], controls: ["Guantes resistentes a cortes", "Descarga de capacitores"] },
        { title: "Inspección del Motor", desc: "Comprobar el estado de las escobillas y los devanados", hazards: ["Inhalación de polvo", "Puntos de pellizco"], controls: ["Mascarilla N95", "Posicionamiento seguro"] }
      ]
    },
    fr: {
      header: "Analyse des Risques Professionnels",
      description: "Consultez ce document avant de commencer le travail",
      title: "Maintenance Électrique - Ligne de Production 3",
      hazards: "Dangers",
      controls: "Contrôles",
      steps: [
        { title: "Isolation & LOTO", desc: "Vérifier l'isolation énergétique et appliquer des verrous", hazards: ["Choc électrique", "Démarrage soudain"], controls: ["Procédure LOTO", "Test de tension"] },
        { title: "Démontage de l'Équipement", desc: "Retirer les couvercles de protection et les pièces internes", hazards: ["Bords tranchants", "Énergie stockée"], controls: ["Gants résistants aux coupures", "Décharge des condensateurs"] },
        { title: "Inspection du Moteur", desc: "Vérifier l'état des brosses et des enroulements", hazards: ["Inhalation de poussière", "Points de pincement"], controls: ["Masque N95", "Positionnement sécurisé"] }
      ]
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('ehs_localization_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAvailableLanguages(["en", ...parsed.secondaryLanguages]);
    }
  }, []);

  const content = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Mobile-friendly Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-gray-900 uppercase tracking-wider leading-tight">UpKeep Safety</h1>
            <p className="text-[10px] text-gray-500 font-medium leading-tight">Public Document Portal</p>
          </div>
        </div>

        {/* Language Switcher - Very prominent for Access Point */}
        <div className="relative">
          <button 
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-all text-xs font-bold text-gray-700 shadow-sm"
          >
            <Globe className="size-3.5 text-blue-600" />
            <span>{LANGUAGE_LABELS[currentLanguage]}</span>
            <ChevronDown className="size-3.5 text-gray-400" />
          </button>
          
          {showLanguageMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLanguageMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Language</p>
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setCurrentLanguage(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                      currentLanguage === lang ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    {LANGUAGE_LABELS[lang]}
                    {currentLanguage === lang && <CheckCircle2 className="size-4" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-200 uppercase tracking-widest">Live Document</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{content.title}</h2>
          <p className="text-sm text-gray-500">{content.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs font-medium text-gray-600">
            <MapPin className="size-3.5" />
            Line 3 - Production
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs font-medium text-gray-600">
            <Calendar className="size-3.5" />
            Updated Jul 15, 2026
          </div>
        </div>

        {/* Steps List - Public Style */}
        <div className="space-y-6">
          {content.steps.map((step: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-l-4 border-l-blue-600">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">{idx + 1}</div>
                  <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 pl-11">{step.desc}</p>
                
                <div className="grid grid-cols-1 gap-4 pl-11">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="size-3" />
                      {content.hazards}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.hazards.map((h: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="size-3" />
                      {content.controls}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.controls.map((c: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Info className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1 tracking-wide uppercase">Safety Confirmation</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                By viewing this document, you acknowledge that you have read and understood the hazards and control measures required for this task. Always follow your local site safety rules.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center">
        <button className="w-full max-w-sm py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 active:scale-95 transition-all">
          Acknowledge & Sign JHA
        </button>
      </div>
    </div>
  );
}
