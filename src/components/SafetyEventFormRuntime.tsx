"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { FieldDef, TemplateVersion, SubmissionPayload } from "../schemas/types";
import { evaluateLogic, isPermanentlyRequired } from "../runtime/logic";
import { validateForm, validateSingleField } from "../utils/validation";
import PayloadDrawer from "./PayloadDrawer";
import { processAIText } from "../utils/aiProcessor";
import { defaultTemplate, CORE_FIELDS } from "../templates/safetyEventTemplate";
import type { SafetyEventTemplate } from "../templates/safetyEventTemplate";
import { templateFieldToFieldDef } from "../templates/fieldTypes";
import { applyLogicRules } from "../utils/logicEngine";
import BodyDiagramField from "./diagrams/BodyDiagramField";
import SceneDiagramField from "./diagrams/SceneDiagramField";
import SketchDrawingField from "./diagrams/SketchDrawingField";
import GPSLocationField from "./GPSLocationField";
import CascadingLocationSelector from "./CascadingLocationSelector";
import { LOCATION_HIERARCHY } from "../samples/locationHierarchy";

type Errors = Record<string, string | undefined>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValue = any;

interface SafetyEventFormRuntimeProps {
  useCustomTemplate?: boolean;
}

function Field({ 
  f, 
  value, 
  setValue, 
  locked, 
  error, 
  visible, 
  required,
  onBlur
}: {
  f: FieldDef; 
  value: FormValue; 
  setValue: (v: FormValue)=>void; 
  locked?: boolean; 
  error?: string;
  visible: boolean;
  required: boolean;
  onBlur?: () => void;
  showStaticBadge?: boolean;
  aiConfidence?: number;
}) {
  const common = (children: React.ReactNode) => (
    <div className="mb-6" style={{ display: visible ? "block" : "none" }}>
      <label className="block">
        <div className="text-sm font-bold text-black mb-1.5">
          {f.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
        {children}
      </label>
      {f.helpText && <div className="text-gray-600 text-xs mt-1.5">{f.helpText}</div>}
      {error && <div className="text-red-600 text-sm mt-1.5">{error}</div>}
    </div>
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const files = Array.from(e.target.files ?? []);
    const fileData = files.map(file => ({
      name: file.name,
      bytes: file.size,
      mime: file.type,
    }));
    setValue(fileData);
  };

  const baseInputClasses = `w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-900 placeholder:text-gray-400 ${
    error ? "border-red-500" : "border-gray-300"
  }`;

  // Special handling for location field - use CascadingLocationSelector
  if (f.id === "location") {
    return (
      <div className="mb-6" style={{ display: visible ? "block" : "none" }}>
        <CascadingLocationSelector
          nodes={LOCATION_HIERARCHY}
          value={typeof value === 'object' ? value?.nodeId : undefined}
          onChange={(nodeId, breadcrumb) => {
            if (!locked) {
              // Store both nodeId and breadcrumb for backward compatibility
              setValue({ nodeId, breadcrumb });
              if (onBlur) onBlur();
            }
          }}
          required={required}
          disabled={locked}
        />
        {error && <div className="text-red-600 text-sm mt-1.5">{error}</div>}
      </div>
    );
  }

  switch (f.type) {
    case "text":
      return common(
        <input 
          className={baseInputClasses}
          value={value ?? ""} 
          onChange={e=>!locked && setValue(e.target.value)} 
          onBlur={onBlur}
          placeholder={f.placeholder}
          disabled={locked}
        />
      );
    case "textarea":
      return common(
        <textarea 
          className={`${baseInputClasses} min-h-[100px] resize-y`}
          value={value ?? ""} 
          onChange={e=>!locked && setValue(e.target.value)} 
          onBlur={onBlur}
          placeholder={f.placeholder}
          disabled={locked}
        />
      );
    case "number":
      return common(
        <input 
          type="number"
          className={baseInputClasses}
          value={value ?? ""} 
          onChange={e=>!locked && setValue(e.target.value ? parseFloat(e.target.value) : "")} 
          onBlur={onBlur}
          placeholder={f.placeholder}
          disabled={locked}
          step="any"
        />
      );
    case "dateTime":
      return common(
        <input 
          type="datetime-local" 
          className={baseInputClasses}
          value={value ?? ""} 
          onChange={e=>!locked && setValue(e.target.value)} 
          onBlur={onBlur}
          disabled={locked}
        />
      );
    case "dropdown":
      return common(
        <select 
          className={`${baseInputClasses} cursor-pointer`}
          value={value ?? ""} 
          onChange={e=>!locked && setValue(e.target.value)}
          onBlur={onBlur}
          disabled={locked}
        >
          <option value="" disabled>Select...</option>
          {(f.options ?? []).map(o => {
            const optVal = typeof o === 'string' ? o : o.value;
            const optLabel = typeof o === 'string' ? o : o.label;
            return <option key={optVal} value={optVal}>{optLabel}</option>;
          })}
        </select>
      );
    case "checkbox":
    case "boolean":
      return common(
        <div className="flex items-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            checked={!!value} 
            onChange={e=>!locked && setValue(e.target.checked)}
            disabled={locked}
          />
        </div>
      );
    case "radio":
      return common(
        <div className="space-y-2">
          {(f.options ?? []).map(option => {
            const optVal = typeof option === 'string' ? option : option.value;
            const optLabel = typeof option === 'string' ? option : option.label;
            return (
              <label key={optVal} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={f.id}
                  value={optVal}
                  checked={value === optVal}
                  onChange={e=>!locked && setValue(e.target.value)}
                  disabled={locked}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">{optLabel}</span>
              </label>
            );
          })}
        </div>
      );
    case "multiselect":
      const selectedValues = Array.isArray(value) ? value : [];
      const handleMultiSelectChange = (optionValue: string, checked: boolean) => {
        if (locked) return;
        const newValues = checked 
          ? [...selectedValues, optionValue]
          : selectedValues.filter(v => v !== optionValue);
        setValue(newValues);
      };
      
      return common(
        <div className="space-y-2">
          {(f.options ?? []).map(option => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            const isChecked = selectedValues.includes(optionValue);
            
            return (
              <label key={optionValue} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => handleMultiSelectChange(optionValue, e.target.checked)}
                  disabled={locked}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">{optionLabel}</span>
              </label>
            );
          })}
        </div>
      );
    case "file":
      const maxFiles = 5;
      const currentFileCount = Array.isArray(value) ? value.length : 0;
      const remainingFiles = maxFiles - currentFileCount;
      
      return (
        <div className="mb-6" style={{ display: visible ? "block" : "none" }}>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <div className="text-sm font-bold text-black">{f.label}</div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {f.helpText && <div className="text-gray-600 text-xs mb-3">{f.helpText}</div>}
          <div>
            <button
              type="button"
              onClick={() => document.getElementById(`file-${f.id}`)?.click()}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              disabled={locked || currentFileCount >= maxFiles}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Browse Media
            </button>
            <input 
              id={`file-${f.id}`}
              type="file" 
              multiple 
              className="hidden"
              onChange={handleFileChange}
              disabled={locked || currentFileCount >= maxFiles}
              accept={f.validation?.fileTypes?.join(",")}
            />
            {remainingFiles > 0 && (
              <div className="mt-3 text-sm text-blue-600">
                {remainingFiles} items remaining
              </div>
            )}
            {currentFileCount >= maxFiles && (
              <div className="mt-3 text-sm text-red-600">
                Maximum number of files reached
              </div>
            )}
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
      );
    case "signature":
      return common(
        <input 
          className={baseInputClasses}
          placeholder="Type your name" 
          value={value ?? ""} 
          onChange={e=>!locked && setValue(e.target.value)} 
          onBlur={onBlur}
          disabled={locked}
        />
      );
    case "bodyDiagram":
      return common(
        <BodyDiagramField
          value={value}
          onChange={(base64) => !locked && setValue(base64)}
          disabled={locked}
        />
      );
    case "sceneDiagram":
      return common(
        <SceneDiagramField
          value={value}
          onChange={(base64) => !locked && setValue(base64)}
          disabled={locked}
        />
      );
    case "sketch":
      return common(
        <SketchDrawingField
          value={value}
          onChange={(base64) => !locked && setValue(base64)}
          disabled={locked}
        />
      );
    case "gpsLocation":
      return common(
        <GPSLocationField
          value={value}
          onChange={(location) => !locked && setValue(location)}
          disabled={locked}
        />
      );
    default:
      return common(<div className="text-gray-600">Unsupported field type: {f.type}</div>);
  }
}

function parseStatic(): { values: Record<string, FormValue> } {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const b64 = params.get("static");
  if (!b64) return { values: {} };
  try {
    const json = JSON.parse(atob(b64.replace(/-/g,'+').replace(/_/g,'/')));
    return { values: json };
  } catch { return { values: {} }; }
}

// Use the existing injury template for conditional logic
import template from "../templates/injury";
import { TemplateContext } from "../contexts/TemplateContext";
const tmpl = template as TemplateVersion;

export default function SafetyEventFormRuntime({ useCustomTemplate = false }: SafetyEventFormRuntimeProps = {}) {
  // Safely get template context without throwing - use useContext directly
  // This avoids the conditional hook issue since useContext never throws
  const templateContextValue = React.useContext(TemplateContext);
  
  const currentTemplate: SafetyEventTemplate = useCustomTemplate && templateContextValue 
    ? (templateContextValue.getTemplate() || defaultTemplate)
    : defaultTemplate;

  const staticPrefill = useMemo(()=>parseStatic().values, []);
  const [values, setValues] = useState<Record<string, FormValue>>({
    title: "", dateTime: new Date().toISOString().slice(0,16), description: "", ...staticPrefill
  });
  const locked: Record<string, boolean> = useMemo(
    () => Object.fromEntries(Object.keys(staticPrefill).map(k => [k, true])),
    [staticPrefill]
  );

  const [errors, setErrors] = useState<Errors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [payloadDrawerOpen, setPayloadDrawerOpen] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<Record<string, number>>({});
  const [fieldOrigin, setFieldOrigin] = useState<Record<string, "manual" | "ai" | "static" | "default">>({});
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // Initialize field origins
  useEffect(() => {
    const origins: Record<string, "manual" | "ai" | "static" | "default"> = {};
    // Mark static fields
    Object.keys(staticPrefill).forEach(k => {
      origins[k] = "static";
    });
    // Mark default fields
    if (values.dateTime) origins.dateTime = "default";
    setFieldOrigin(prev => ({ ...origins, ...prev }));
  }, [staticPrefill, values.dateTime]);

  // Build allFields from template definition
  const allFields: FieldDef[] = useMemo(() => {
    // Map TemplateField[] to FieldDef[] using the converter
    return currentTemplate.fields.map(templateFieldToFieldDef);
  }, [currentTemplate]);

  // Create field definitions map
  const fieldMap = useMemo(() => {
    const map = new Map<string, FieldDef>();
    allFields.forEach(f => map.set(f.id, f));
    return map;
  }, [allFields]);

  // Track setValue actions that were ignored due to locks
  const [ignoredSetValues, setIgnoredSetValues] = useState<Set<string>>(new Set());

  // Evaluate logic rules reactively on every change
  // Evaluate logic from OLD template system (tmpl.logic) OR NEW template system (currentTemplate.logicRules)
  const logicResult = useMemo(() => {
    // If using custom template and it has logic rules, use the new logic engine
    if (useCustomTemplate && currentTemplate.logicRules && currentTemplate.logicRules.length > 0) {
      const coreFieldIds = CORE_FIELDS.map(f => f.id);
      const { fieldVisibility, fieldRequired } = applyLogicRules(
        currentTemplate.logicRules,
        values,
        currentTemplate.fields,
        coreFieldIds
      );
      
      // Convert to old format (Maps) for compatibility with rest of component
      const visibility = new Map<string, boolean>();
      const required = new Map<string, boolean>();
      
      Object.entries(fieldVisibility).forEach(([id, visible]) => {
        visibility.set(id, visible);
      });
      
      Object.entries(fieldRequired).forEach(([id, req]) => {
        required.set(id, req);
      });
      
      return {
        visibility,
        required,
        setValues: new Map<string, FormValue>() // No setValue actions in new logic system
      };
    }
    
    // Otherwise, use old template system
    return evaluateLogic(tmpl.logic, values, fieldMap);
  }, [values, fieldMap, useCustomTemplate, currentTemplate]);

  // Apply setValue actions from logic (but respect static locks)
  useEffect(() => {
    const newIgnored = new Set<string>();
    logicResult.setValues.forEach((newValue, fieldId) => {
      // Don't override locked fields
      if (locked[fieldId]) {
        newIgnored.add(fieldId);
      } else {
        setValues(prev => {
          if (prev[fieldId] !== newValue) {
            return { ...prev, [fieldId]: newValue };
          }
          return prev;
        });
      }
    });
    setIgnoredSetValues(newIgnored);
  }, [logicResult.setValues, locked]);

  // Get computed visibility and requirements
  const fieldVisibility = useMemo(() => {
    const vis = new Map<string, boolean>();
    allFields.forEach(f => {
      const computed = logicResult.visibility.get(f.id);
      vis.set(f.id, computed ?? f.visible !== false);
    });
    return vis;
  }, [logicResult.visibility, allFields]);

  const fieldRequirements = useMemo(() => {
    const req = new Map<string, boolean>();
    allFields.forEach(f => {
      // Permanently required fields always required
      if (isPermanentlyRequired(f.id)) {
        req.set(f.id, true);
      } else {
        const computed = logicResult.required.get(f.id);
        req.set(f.id, computed ?? f.required === true);
      }
    });
    return req;
  }, [logicResult.required, allFields]);

  function setValue(id: string, v: FormValue) {
    // Don't allow changes to locked fields
    if (locked[id]) return;
    
    setValues(prev => ({ ...prev, [id]: v }));
    setTouchedFields(prev => new Set(prev).add(id));
    
    // If user manually edits an AI-suggested field, remove AI badge
    if (fieldOrigin[id] === "ai") {
      setAiConfidence(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setFieldOrigin(prev => ({ ...prev, [id]: "manual" }));
    } else if (fieldOrigin[id] !== "static") {
      setFieldOrigin(prev => ({ ...prev, [id]: "manual" }));
    }
  }

  async function processAIDescription(text: string) {
    if (!text.trim() || isAIProcessing) return;
    
    setIsAIProcessing(true);
    
    try {
      // Simulate 500ms delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const aiSuggestions = processAIText(text);
      
      aiSuggestions.forEach(({ fieldId, value, confidence }) => {
        // Don't override locked fields
        if (locked[fieldId]) return;
        
        // Merge: only set if field is empty or user hasn't manually edited
        if (!values[fieldId] || fieldOrigin[fieldId] === "default") {
          setValues(prev => ({ ...prev, [fieldId]: value }));
          setAiConfidence(prev => ({ ...prev, [fieldId]: confidence }));
          setFieldOrigin(prev => ({ ...prev, [fieldId]: "ai" }));
        }
      });
    } catch (error) {
      console.error("AI processing error:", error);
    } finally {
      setIsAIProcessing(false);
    }
  }

  function handleBlur(fieldId: string) {
    setTouchedFields(prev => new Set(prev).add(fieldId));
    
    // Validate single field on blur if it's required
    const field = fieldMap.get(fieldId);
    if (field) {
      const isVisible = fieldVisibility.get(fieldId) ?? true;
      const isRequired = fieldRequirements.get(fieldId) ?? false;
      const value = values[fieldId];
      
      if (isRequired || touchedFields.has(fieldId)) {
        const error = validateSingleField(field, value, isVisible, isRequired);
        setErrors(prev => ({
          ...prev,
          [fieldId]: error?.message
        }));
      }
    }
  }

  function validate(): boolean {
    const result = validateForm(allFields, values, fieldVisibility, fieldRequirements);
    
    const errorMap: Errors = {};
    result.errors.forEach(err => {
      errorMap[err.fieldId] = err.message;
    });
    
    setErrors(errorMap);
    return result.isValid;
  }

  function serialize(): SubmissionPayload {
    const system = {
      title: values.title,
      dateTime: values.dateTime,
      type: values.type,
      location: values.location,
      description: values.description
    };
    const sysKeys = new Set(["title","dateTime","type","location","description"]);
    const custom: Record<string, FormValue> = {};
    for (const k of Object.keys(values)) if (!sysKeys.has(k)) custom[k] = values[k];
    
    // Build attachments array for file fields
    const attachments: SubmissionPayload["attachments"] = [];
    allFields.forEach(f => {
      if (f.type === "file" && Array.isArray(values[f.id])) {
        (values[f.id] as Array<{ name: string; mime?: string; bytes?: number }>).forEach((file) => {
          attachments.push({
            fieldId: f.id,
            name: file.name,
            mime: file.mime,
            bytes: file.bytes,
          });
        });
      }
    });

    // Build origin map: "static" for locked prefills, "ai" when last set by AI, else "manual"
    const origin: Record<string, "manual" | "ai" | "static" | "default"> = {};
    
    // All field IDs (custom + system)
    const allFieldIdSet = new Set<string>();
    allFields.forEach(f => allFieldIdSet.add(f.id));
    sysKeys.forEach(key => allFieldIdSet.add(key));
    
    allFieldIdSet.forEach(fieldId => {
      // Check if locked (static prefill)
      if (locked[fieldId]) {
        origin[fieldId] = "static";
      } else if (fieldOrigin[fieldId] === "ai") {
        origin[fieldId] = "ai";
      } else if (fieldOrigin[fieldId] === "default") {
        origin[fieldId] = "default";
      } else {
        // Default to manual if field has a value, otherwise don't include
        const fieldValue = values[fieldId];
        if (fieldValue !== undefined && fieldValue !== "" && fieldValue !== null && 
            !(Array.isArray(fieldValue) && fieldValue.length === 0)) {
          origin[fieldId] = "manual";
        }
      }
    });

    return {
      templateVersionId: tmpl.id,
      system,
      values: custom,
      attachments: attachments.length > 0 ? attachments : undefined,
      aiConfidence: Object.keys(aiConfidence).length > 0 ? aiConfidence : undefined,
      origin: Object.keys(origin).length > 0 ? origin : undefined,
    };
  }

  function onSubmit() {
    // Ensure AI suggestions don't auto-submit - user must explicitly click submit
    // Validation will still check required fields even if AI suggested values
    if (!validate()) return;
    
    // Allow submission - validation ensures required fields exist
    const payload = serialize();
    alert("SubmissionPayload\n" + JSON.stringify(payload, null, 2));
  }

  // Get visible fields for rendering (don't render hidden fields)
  const visibleFields = useMemo(() => {
    return allFields.filter(f => {
      const isVisible = fieldVisibility.get(f.id);
      return isVisible !== false && isVisible !== undefined;
    });
  }, [allFields, fieldVisibility]);


  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Report Safety Event</h1>
      <p className="text-sm text-gray-600 mb-6">Use this form to report safety incidents or near misses that occurred in your facility.</p>

      {/* Describe the issue - Blue box section (always shown at top) */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">Describe the issue</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-2 text-sm text-gray-700 mb-4">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Speak or type your event description</span>
          </div>
          
          {/* AI Assist Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={async () => {
                const descText = values.description || "";
                if (descText.trim()) {
                  await processAIDescription(descText);
                }
              }}
              disabled={isAIProcessing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isAIProcessing ? "Processing..." : "✨ AI Assist"}
            </button>
          </div>
          
          {/* Voice/Type Toggle */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setInputMode("voice")}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                inputMode === "voice"
                  ? "bg-white border-2 border-blue-600 text-blue-600"
                  : "bg-white border border-gray-300 text-gray-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice
            </button>
            <button
              onClick={() => setInputMode("type")}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                inputMode === "type"
                  ? "bg-white border-2 border-blue-600 text-blue-600"
                  : "bg-white border border-gray-300 text-gray-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Type
            </button>
          </div>
          
          {/* Content based on mode */}
          {inputMode === "voice" ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-600">Click to record your description (max 60s)</p>
              <button className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 italic">Voice recording stubbed for prototype</p>
            </div>
          ) : (
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-y bg-white"
              placeholder="Describe what happened in detail..."
              value={values.description || ""}
              onChange={(e) => setValue("description", e.target.value)}
              onBlur={() => handleBlur("description")}
            />
          )}
        </div>
      </div>

      {/* Form Fields - Single Column with some side-by-side pairs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {(() => {
          // Show all fields from template, including description (it will appear both in AI section and in regular fields)
          const fields = visibleFields;
          const rendered: React.ReactNode[] = [];
          let i = 0;
          
          // Define which fields should be side by side
          const sideBySidePairs = [
            ["location", "assets"],
            ["hazard", "severity"]
          ];
          
          while (i < fields.length) {
            const f = fields[i];
            
            // Check if this field is part of a side-by-side pair
            const pairIndex = sideBySidePairs.findIndex(pair => pair[0] === f.id);
            if (pairIndex !== -1 && i + 1 < fields.length) {
              const nextField = fields[i + 1];
              if (sideBySidePairs[pairIndex][1] === nextField.id) {
                // Render as a two-column grid
                const f1 = f;
                const f2 = nextField;
                
                const isVisible1 = fieldVisibility.get(f1.id) ?? true;
                const isRequired1 = fieldRequirements.get(f1.id) ?? false;
                const isLocked1 = locked[f1.id] ?? false;
                const showStaticBadge1 = isLocked1 || ignoredSetValues.has(f1.id);
                const confidence1 = aiConfidence[f1.id];
                
                const isVisible2 = fieldVisibility.get(f2.id) ?? true;
                const isRequired2 = fieldRequirements.get(f2.id) ?? false;
                const isLocked2 = locked[f2.id] ?? false;
                const showStaticBadge2 = isLocked2 || ignoredSetValues.has(f2.id);
                const confidence2 = aiConfidence[f2.id];
                
                rendered.push(
                  <div key={`pair-${f1.id}-${f2.id}`} className="grid grid-cols-2 gap-4">
                    <Field
                      f={f1}
                      value={values[f1.id]}
                      setValue={(v)=>setValue(f1.id, v)}
                      locked={isLocked1}
                      error={errors[f1.id]}
                      visible={isVisible1}
                      required={isRequired1}
                      onBlur={() => handleBlur(f1.id)}
                      showStaticBadge={showStaticBadge1}
                      aiConfidence={confidence1}
                    />
                    <Field
                      f={f2}
                      value={values[f2.id]}
                      setValue={(v)=>setValue(f2.id, v)}
                      locked={isLocked2}
                      error={errors[f2.id]}
                      visible={isVisible2}
                      required={isRequired2}
                      onBlur={() => handleBlur(f2.id)}
                      showStaticBadge={showStaticBadge2}
                      aiConfidence={confidence2}
                    />
                  </div>
                );
                i += 2;
                continue;
              }
            }
            
            // Render as single column
            const isVisible = fieldVisibility.get(f.id) ?? true;
            const isRequired = fieldRequirements.get(f.id) ?? false;
            const isLocked = locked[f.id] ?? false;
            const showStaticBadge = isLocked || ignoredSetValues.has(f.id);
            const confidence = aiConfidence[f.id];
            
            rendered.push(
              <Field
                key={f.id}
                f={f}
                value={values[f.id]}
                setValue={(v)=>setValue(f.id, v)}
                locked={isLocked}
                error={errors[f.id]}
                visible={isVisible}
                required={isRequired}
                onBlur={() => handleBlur(f.id)}
                showStaticBadge={showStaticBadge}
                aiConfidence={confidence}
              />
            );
            i++;
          }
          
          return rendered;
        })()}
      </div>

      {/* Bottom Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button 
          onClick={() => {
            setValues({
              title: "", 
              dateTime: new Date().toISOString().slice(0,16), 
              description: "", 
              ...staticPrefill
            });
            setErrors({});
            setTouchedFields(new Set());
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
        >
          Reset
        </button>
        <button 
          onClick={() => setPayloadDrawerOpen(true)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
        >
          Preview JSON
        </button>
        <button 
          onClick={onSubmit} 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Submit Safety Event
        </button>
      </div>

      <PayloadDrawer
        isOpen={payloadDrawerOpen}
        onClose={() => setPayloadDrawerOpen(false)}
        payload={serialize()}
      />
    </>
  );
}

