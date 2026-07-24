"use client";

import React, { useState, useCallback, useRef } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../../src/components/Sidebar";
import { TemplateProvider, useTemplate } from "../../../../src/contexts/TemplateContext";
import FieldPalette from "../../../../src/components/FieldPalette";
import FormCanvas from "../../../../src/components/FormCanvas";
import FieldSettingsPanel from "../../../../src/components/FieldSettingsPanel";
import LogicRulesPanel from "../../../../src/components/LogicRulesPanel";
import ValidationErrorsModal from "../../../../src/components/ValidationErrorsModal";
import type { ValidationError } from "../../../../src/utils/templateValidation";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { 
  INCIDENT_DETAILS_FIELDS,
  INJURY_MEDICAL_FIELDS,
  CAUSE_RISK_FIELDS,
  ENVIRONMENTAL_PROPERTY_FIELDS,
  GUEST_LEGAL_FIELDS,
  SIGNOFF_REVIEW_FIELDS,
  DIAGRAMS_SKETCHES_FIELDS
} from "../../../../src/templates/paletteFields";
import { BASIC_FIELD_TYPES, createCustomField } from "../../../../src/templates/fieldTypes";
import { CORE_FIELDS } from "../../../../src/templates/safetyEventTemplate";
import type { TemplateField } from "../../../../src/templates/safetyEventTemplate";

// Singleton field types (only allow one instance of each on a form)
const SINGLETON_FIELD_TYPES = ['bodyDiagram', 'sceneDiagram', 'sketch', 'gpsLocation'];

interface TemplateBuilderPageProps {
  params: Promise<{ templateId: string }>;
}

function TemplateBuilderContent({ templateId }: { templateId: string }) {
  const router = useRouter();
  const { 
    getTemplate, 
    addField, 
    removeField, 
    updateField, 
    reorderFields, 
    renameTemplate,
    updateTemplateStatus,
    addLogicRule,
    updateLogicRule,
    deleteLogicRule,
    saveTemplates, 
    hasUnsavedChanges 
  } = useTemplate();

  const template = getTemplate(templateId);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(template?.name || "");
  const [activeTab, setActiveTab] = useState<'fields' | 'logic'>('fields');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const isArchived = template?.status === 'archived';
  
  // Ref to prevent double-adding fields
  const isAddingFieldRef = useRef<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'archived') => {
    const result = updateTemplateStatus(templateId, newStatus);
    
    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      setShowValidationModal(true);
    }
    
    setShowStatusMenu(false);
  };

  // Helper to add a field (used by both drag-drop and click)
  const handleAddFieldById = useCallback((fieldId: string, insertIndex?: number) => {
    if (!template) return;
    
    // Prevent double-adds using a flag
    if (isAddingFieldRef.current) return;
    isAddingFieldRef.current = true;
    
    // Reset the flag after a delay
    setTimeout(() => {
      isAddingFieldRef.current = false;
    }, 300);

    // Check all palette field groups for matching field
    const allPaletteFields = [
      ...INCIDENT_DETAILS_FIELDS,
      ...INJURY_MEDICAL_FIELDS,
      ...CAUSE_RISK_FIELDS,
      ...ENVIRONMENTAL_PROPERTY_FIELDS,
      ...GUEST_LEGAL_FIELDS,
      ...SIGNOFF_REVIEW_FIELDS,
      ...DIAGRAMS_SKETCHES_FIELDS
    ];
    
    const paletteField = allPaletteFields.find(f => f.id === fieldId);
    if (paletteField) {
      // Check if this is a singleton field type and already exists
      if (SINGLETON_FIELD_TYPES.includes(paletteField.componentType)) {
        const existingField = template.fields.find(f => f.componentType === paletteField.componentType);
        if (existingField) {
          setSelectedFieldId(existingField.id);
          return;
        }
      }
      
      // Generate a unique ID for the field instance
      const uniqueId = `${paletteField.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Make sure locked is explicitly false for non-core fields
      const newField = { ...paletteField, id: uniqueId, locked: false };
      addField(templateId, newField, insertIndex);
      setSelectedFieldId(uniqueId);
      return;
    }
    
    // Check if it's a basic field type
    const basicType = BASIC_FIELD_TYPES.find(t => t.id === fieldId);
    if (basicType) {
      // Create a new custom field
      const newField = createCustomField(basicType);
      addField(templateId, newField, insertIndex);
      setSelectedFieldId(newField.id);
      return;
    }
  }, [template, templateId, addField, setSelectedFieldId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;

    // Don't process if there's no drop target or template
    if (!over || !template) return;
    
    // Don't process clicks that didn't actually drag (safety check)
    if (Math.abs(delta.x) < 3 && Math.abs(delta.y) < 3) return;

    // Handle drag from palette
    if (active.id.toString().startsWith('palette-')) {
      const fieldId = active.id.toString().replace('palette-', '');
      
      // Determine insertion index based on drop target
      let insertIndex: number | undefined = undefined;
      
      // If dropping over a specific field (not the canvas itself)
      if (over.id !== 'form-canvas') {
        const nonCoreFields = template.fields.filter(f => !f.locked);
        const targetIndex = nonCoreFields.findIndex(f => f.id === over.id);
        if (targetIndex !== -1) {
          // Calculate the absolute index in the full fields array
          const coreFieldsCount = template.fields.filter(f => f.locked).length;
          insertIndex = coreFieldsCount + targetIndex;
        }
      }
      
      handleAddFieldById(fieldId, insertIndex);
      return;
    }

    // Handle reordering within canvas
    if (active.id !== over.id) {
      const nonCoreFields = template.fields.filter(f => !f.locked);
      const oldIndex = nonCoreFields.findIndex(f => f.id === active.id);
      const newIndex = nonCoreFields.findIndex(f => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(nonCoreFields, oldIndex, newIndex);
        reorderFields(templateId, reordered.map(f => f.id));
      }
    }
  }, [template, templateId, reorderFields, handleAddFieldById]);

  const handleRemoveField = (fieldId: string) => {
    removeField(templateId, fieldId);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleUpdateField = (fieldId: string, updates: Partial<TemplateField>) => {
    updateField(templateId, fieldId, updates);
  };

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== template?.name) {
      renameTemplate(templateId, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleSave = () => {
    saveTemplates();
    router.push("/settings/safety-templates");
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push("/settings/safety-templates");
      }
    } else {
      router.push("/settings/safety-templates");
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-600 mb-4">The template you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/settings/safety-templates"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  const selectedField = selectedFieldId ? template.fields.find(f => f.id === selectedFieldId) || null : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 ml-64">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-lg font-semibold">UpKeep EHS</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">4</span>
            </button>
            <Link href="/safetyevents/new" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              + Create
            </Link>
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-medium text-sm">J</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Builder Header */}
      <div className="ml-64 bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/settings/safety-templates"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Safety Templates
            </Link>
            <span className="text-gray-400">/</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditedName(template.name);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none px-1"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={isArchived}
                className={`px-3 py-1 text-xs font-medium rounded-full border inline-flex items-center gap-1 ${
                  template.status === 'draft' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                  template.status === 'active' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                } ${isArchived ? 'cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
              >
                {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                {!isArchived && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {showStatusMenu && !isArchived && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => handleStatusChange('draft')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    disabled={template.status === 'draft'}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    disabled={template.status === 'active'}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleStatusChange('archived')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Archived
                  </button>
                </div>
              )}
            </div>
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/safetyevents/template-form?templateId=${templateId}`}
              target="_blank"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Form
            </Link>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isArchived}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ml-64 bg-white border-b border-gray-200 px-8">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'fields'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fields
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Logic
          </button>
        </div>
      </div>

      {/* 3-Column Builder / Logic Panel */}
      {activeTab === 'fields' ? (
        <div className="ml-64 h-[calc(100vh-180px)] flex">
          {!isArchived ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {/* Left: Field Palette */}
              <FieldPalette onAddField={handleAddFieldById} />

              {/* Center: Form Canvas */}
              <FormCanvas
                fields={template.fields}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
                onRemoveField={handleRemoveField}
              />

              {/* Right: Field Settings */}
              <FieldSettingsPanel
                field={selectedField}
                onUpdateField={(updates) => {
                  if (selectedFieldId) {
                    handleUpdateField(selectedFieldId, updates);
                  }
                }}
                onRemoveField={() => {
                  if (selectedFieldId) {
                    handleRemoveField(selectedFieldId);
                  }
                }}
              />
            </DndContext>
          ) : (
            <>
              {/* Read-only Field Palette (grayed out) */}
              <div className="w-80 opacity-50 pointer-events-none">
                <FieldPalette />
              </div>
              
              {/* Read-only Form Canvas */}
              <div className="flex-1">
                <FormCanvas
                  fields={template.fields}
                  selectedFieldId={selectedFieldId}
                  onSelectField={() => {}} 
                  onRemoveField={() => {}}
                />
              </div>
              
              {/* Read-only Field Settings */}
              <div className="w-80 opacity-50">
                {selectedFieldId && selectedField ? (
                  <FieldSettingsPanel
                    field={selectedField}
                    onUpdateField={() => {}}
                    onRemoveField={() => {}}
                    isReadOnly={true}
                  />
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mt-6 mr-6">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-gray-500 text-sm">This template is archived</p>
                    <p className="text-gray-400 text-xs mt-2">No edits allowed</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="ml-64 h-[calc(100vh-180px)] overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {isArchived ? (
              <div className="opacity-50 pointer-events-none">
                <LogicRulesPanel
                  rules={template.logicRules || []}
                  fields={template.fields}
                  coreFieldIds={CORE_FIELDS.map(f => f.id)}
                  onAddRule={() => {}}
                  onUpdateRule={() => {}}
                  onDeleteRule={() => {}}
                />
              </div>
            ) : (
              <LogicRulesPanel
                rules={template.logicRules || []}
                fields={template.fields}
                coreFieldIds={CORE_FIELDS.map(f => f.id)}
                onAddRule={(rule) => addLogicRule(templateId, rule)}
                onUpdateRule={(ruleId, updates) => updateLogicRule(templateId, ruleId, updates)}
                onDeleteRule={(ruleId) => deleteLogicRule(templateId, ruleId)}
              />
            )}
          </div>
        </div>
      )}

      {/* Validation Errors Modal */}
      <ValidationErrorsModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
        title="Cannot Activate Template"
      />
    </div>
  );
}

export default function TemplateBuilderPage({ params }: TemplateBuilderPageProps) {
  const { templateId } = use(params);

  return (
    <TemplateProvider selectedTemplateId={templateId}>
      <TemplateBuilderContent templateId={templateId} />
    </TemplateProvider>
  );
}

