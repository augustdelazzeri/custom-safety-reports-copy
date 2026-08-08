export interface InspectionTask {
  id: string;
  label: string;
  taskType: 'Pass/Fail' | 'Text' | 'Number' | 'Multiple Choice' | 'Signature' | 'Checkbox';
  photoRequired?: boolean;
  noteRequired?: boolean;
  urlRequired?: boolean;
  instructions?: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  type: 'inspection';
  sourceAuditId?: string;
  sourceAuditTitle?: string;
  fieldsCount: number;
  conditionsCount: number;
  createdBy: string;
  createdAt: string;
  tasks: InspectionTask[];
}

const STORAGE_KEY_TEMPLATES = 'ehs_prototype_inspection_templates';
const STORAGE_KEY_AP_LINKS = 'ehs_prototype_ap_inspection_links';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function listInspectionTemplates(): InspectionTemplate[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading inspection templates from localStorage:', e);
    return [];
  }
}

export function getInspectionTemplate(id: string): InspectionTemplate | null {
  const templates = listInspectionTemplates();
  return templates.find((t) => t.id === id) || null;
}

export function saveInspectionTemplate(template: InspectionTemplate): void {
  if (!isBrowser()) return;
  try {
    const existing = listInspectionTemplates();
    const index = existing.findIndex((t) => t.id === template.id);
    if (index >= 0) {
      existing[index] = template;
    } else {
      existing.unshift(template);
    }
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving inspection template to localStorage:', e);
  }
}

export function deleteInspectionTemplate(id: string): void {
  if (!isBrowser()) return;
  try {
    const existing = listInspectionTemplates();
    const filtered = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting inspection template from localStorage:', e);
  }
}

export function listInspectionTemplatesForAudit(auditId: string): InspectionTemplate[] {
  const templates = listInspectionTemplates();
  return templates.filter((t) => t.sourceAuditId === auditId);
}

export function createInspectionTemplateFromAudit(auditId: string, auditTitle: string): InspectionTemplate {
  const existingForAudit = listInspectionTemplatesForAudit(auditId);
  const sequenceNumber = existingForAudit.length + 1;
  const templateName = `${auditTitle} - Inspection ${sequenceNumber}`;
  const templateId = `insp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const defaultTasks: InspectionTask[] = [
    {
      id: 't-1',
      label: 'Inspect Tires for Wear and Damage',
      taskType: 'Pass/Fail',
      photoRequired: true,
      noteRequired: true,
      urlRequired: false,
    },
    {
      id: 't-2',
      label: 'Check Forklift Brakes & Emergency Stop',
      taskType: 'Pass/Fail',
      photoRequired: false,
      noteRequired: true,
      urlRequired: false,
    },
    {
      id: 't-3',
      label: 'Test Steering Control and Horn',
      taskType: 'Pass/Fail',
      photoRequired: false,
      noteRequired: false,
      urlRequired: false,
    },
    {
      id: 't-4',
      label: 'Technician Notes / Incident Observations',
      taskType: 'Text',
      photoRequired: false,
      noteRequired: false,
      urlRequired: false,
    },
    {
      id: 't-5',
      label: 'Inspector Signature',
      taskType: 'Signature',
      photoRequired: false,
      noteRequired: false,
      urlRequired: false,
    },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newTemplate: InspectionTemplate = {
    id: templateId,
    name: templateName,
    type: 'inspection',
    sourceAuditId: auditId,
    sourceAuditTitle: auditTitle,
    fieldsCount: defaultTasks.length,
    conditionsCount: 0,
    createdBy: 'August Delazzeri (AI Generated)',
    createdAt: `${dateStr} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    tasks: defaultTasks,
  };

  saveInspectionTemplate(newTemplate);

  // Link by default to main access points (e.g., ap1) so it shows up immediately in Access Point scans
  linkTemplatesToAccessPoint('ap1', [templateId]);

  return newTemplate;
}

export function getLinkedInspectionTemplateIds(accessPointId: string): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AP_LINKS);
    if (!raw) return [];
    const map = JSON.parse(raw);
    return map[accessPointId] || [];
  } catch (e) {
    return [];
  }
}

export function linkTemplatesToAccessPoint(accessPointId: string, templateIds: string[]): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AP_LINKS);
    const map = raw ? JSON.parse(raw) : {};
    const existing = map[accessPointId] || [];
    const combined = Array.from(new Set([...existing, ...templateIds]));
    map[accessPointId] = combined;
    localStorage.setItem(STORAGE_KEY_AP_LINKS, JSON.stringify(map));
  } catch (e) {
    console.error('Error linking templates to access point:', e);
  }
}
