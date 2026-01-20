/**
 * Organized Palette Fields for Template Builder
 * 
 * Defines preconfigured safety fields organized into logical groups.
 * Admins can drag these into their templates instead of building from scratch.
 */

import type { TemplateField } from "./safetyEventTemplate";

// Incident Details - generic fields that apply to most safety events
export const INCIDENT_DETAILS_FIELDS: TemplateField[] = [
  {
    id: "type",
    fieldType: "common",
    componentType: "dropdown",
    label: "Report Type",
    helpText: "Select the type of event you are reporting",
    required: false,
    options: [
      { value: "Incident", label: "Incident" },
      { value: "Near Miss", label: "Near Miss" },
      { value: "Observation", label: "Observation" },
      { value: "Customer Incident", label: "Customer Incident" }
    ]
  },
  {
    id: "location",
    fieldType: "common",
    componentType: "text",
    label: "Location",
    helpText: "Where did this event take place?",
    placeholder: "e.g., Building A, Floor 2",
    required: false
  },
  {
    id: "gpsLocation",
    fieldType: "common",
    componentType: "gpsLocation",
    label: "GPS Location",
    helpText: "Automatically captures your current GPS coordinates",
    required: true
  },
  {
    id: "hazard",
    fieldType: "common",
    componentType: "dropdown",
    label: "Hazard Category",
    helpText: "Primary hazard type",
    required: false,
    options: [
      { value: "Slip/Trip/Fall", label: "Slip/Trip/Fall" },
      { value: "Struck By/Against", label: "Struck By/Against" },
      { value: "Caught In/Between", label: "Caught In/Between" },
      { value: "Ergonomic", label: "Ergonomic" },
      { value: "Chemical Exposure", label: "Chemical Exposure" },
      { value: "Electrical", label: "Electrical" },
      { value: "Fire/Explosion", label: "Fire/Explosion" },
      { value: "Other", label: "Other" }
    ]
  },
  {
    id: "severity",
    fieldType: "common",
    componentType: "dropdown",
    label: "Severity Level",
    helpText: "Estimated severity of the incident",
    required: false,
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" }
    ]
  },
  {
    id: "immediateActions",
    fieldType: "common",
    componentType: "textarea",
    label: "Immediate Actions Taken",
    helpText: "What immediate steps were taken to address the situation?",
    placeholder: "Describe actions taken immediately after the event...",
    required: false
  },
  {
    id: "media",
    fieldType: "common",
    componentType: "file",
    label: "Photos / Media",
    helpText: "Upload photos or documents related to this event (up to 5 files, 10MB each)",
    required: false,
    validation: {
      maxFiles: 5,
      maxSize: 10485760
    }
  },
  {
    id: "additionalDetails",
    fieldType: "common",
    componentType: "textarea",
    label: "Additional Details",
    helpText: "Any additional information or context",
    placeholder: "Provide any additional details...",
    required: false
  },
  {
    id: "personType",
    fieldType: "common",
    componentType: "dropdown",
    label: "Person Type",
    helpText: "Type of person involved in the incident",
    required: false,
    options: [
      { value: "Worker", label: "Worker" },
      { value: "Contractor", label: "Contractor" },
      { value: "Visitor", label: "Visitor" },
      { value: "Customer", label: "Customer" }
    ]
  }
];

// Injury & Medical fields
export const INJURY_MEDICAL_FIELDS: TemplateField[] = [
  {
    id: "injuryType",
    fieldType: "common",
    componentType: "dropdown",
    label: "Injury Type",
    helpText: "Primary type of injury sustained",
    required: false,
    options: [
      { value: "Slip / Trip / Fall", label: "Slip / Trip / Fall" },
      { value: "Struck by object", label: "Struck by object" },
      { value: "Caught in/between", label: "Caught in/between" },
      { value: "Overexertion", label: "Overexertion" },
      { value: "Exposure", label: "Exposure" },
      { value: "Other", label: "Other" }
    ]
  },
  {
    id: "bodyPartAffected",
    fieldType: "common",
    componentType: "multiselect",
    label: "Body Part Affected",
    helpText: "Select all body parts affected by the injury",
    required: false,
    options: [
      { value: "Head", label: "Head" },
      { value: "Neck", label: "Neck" },
      { value: "Back", label: "Back" },
      { value: "Arm", label: "Arm" },
      { value: "Hand", label: "Hand" },
      { value: "Torso", label: "Torso" },
      { value: "Leg", label: "Leg" },
      { value: "Foot", label: "Foot" },
      { value: "Multiple", label: "Multiple" }
    ]
  },
  {
    id: "ppeWorn",
    fieldType: "common",
    componentType: "checkbox",
    label: "PPE Worn?",
    helpText: "Was personal protective equipment being worn?",
    required: false
  },
  {
    id: "ppeType",
    fieldType: "common",
    componentType: "multiselect",
    label: "PPE Type",
    helpText: "Select all PPE that was worn",
    required: false,
    options: []
  },
  {
    id: "medicalAttentionRequired",
    fieldType: "common",
    componentType: "checkbox",
    label: "Medical Attention Required?",
    helpText: "Did the injured person require medical attention?",
    required: false
  },
  {
    id: "medicalTreatmentType",
    fieldType: "common",
    componentType: "dropdown",
    label: "Medical Treatment Type",
    helpText: "Type of medical treatment received",
    required: false,
    options: [
      { value: "First aid only", label: "First aid only" },
      { value: "Clinic visit", label: "Clinic visit" },
      { value: "Hospitalization", label: "Hospitalization" },
      { value: "Emergency room", label: "Emergency room" },
      { value: "None", label: "None" }
    ]
  },
  {
    id: "lostTimeRestrictedDuty",
    fieldType: "common",
    componentType: "dropdown",
    label: "Lost Time / Restricted Duty?",
    helpText: "Did the injury result in lost time or restricted duty?",
    required: false,
    options: [
      { value: "No lost time", label: "No lost time" },
      { value: "Restricted duty", label: "Restricted duty" },
      { value: "Lost time", label: "Lost time" }
    ]
  }
];

// Cause & Risk Analysis fields
export const CAUSE_RISK_FIELDS: TemplateField[] = [
  {
    id: "immediateCause",
    fieldType: "common",
    componentType: "textarea",
    label: "Immediate Cause",
    helpText: "What directly caused the incident?",
    placeholder: "Describe the immediate cause...",
    required: false
  },
  {
    id: "rootCause",
    fieldType: "common",
    componentType: "textarea",
    label: "Root Cause",
    helpText: "What underlying factors led to the incident?",
    placeholder: "Describe the root cause...",
    required: false
  },
  {
    id: "contributingFactors",
    fieldType: "common",
    componentType: "textarea",
    label: "Contributing Factors",
    helpText: "What other factors contributed to the incident?",
    placeholder: "List contributing factors...",
    required: false
  },
  {
    id: "riskRatingPreControl",
    fieldType: "common",
    componentType: "dropdown",
    label: "Risk Rating (Pre-Control)",
    helpText: "Risk level before controls were applied",
    required: false,
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
      { value: "Critical", label: "Critical" }
    ]
  },
  {
    id: "riskRatingPostControl",
    fieldType: "common",
    componentType: "dropdown",
    label: "Risk Rating (Post-Control)",
    helpText: "Risk level after controls were applied",
    required: false,
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
      { value: "Critical", label: "Critical" }
    ]
  }
];

// Environmental & Property Impact fields
export const ENVIRONMENTAL_PROPERTY_FIELDS: TemplateField[] = [
  {
    id: "environmentalImpact",
    fieldType: "common",
    componentType: "checkbox",
    label: "Environmental Impact?",
    helpText: "Did this incident have an environmental impact?",
    required: false
  },
  {
    id: "environmentalImpactType",
    fieldType: "common",
    componentType: "multiselect",
    label: "Type of Environmental Impact",
    helpText: "Select all types of environmental impact",
    required: false,
    options: []
  },
  {
    id: "estimatedQuantityReleased",
    fieldType: "common",
    componentType: "number",
    label: "Estimated Quantity Released",
    helpText: "Approximate amount of substance released",
    placeholder: "e.g. 20 gallons",
    required: false
  },
  {
    id: "propertyDamage",
    fieldType: "common",
    componentType: "checkbox",
    label: "Property Damage?",
    helpText: "Was there damage to property or equipment?",
    required: false
  },
  {
    id: "estimatedDamageCost",
    fieldType: "common",
    componentType: "number",
    label: "Estimated Damage Cost",
    helpText: "Estimated cost to repair or replace damaged property",
    placeholder: "Enter amount in dollars",
    required: false
  }
];

// Guest / Customer & Legal fields
export const GUEST_LEGAL_FIELDS: TemplateField[] = [
  {
    id: "guestCustomerName",
    fieldType: "common",
    componentType: "text",
    label: "Guest / Customer Name",
    helpText: "Name of the guest or customer involved",
    placeholder: "Enter full name",
    required: false
  },
  {
    id: "guestContactInfo",
    fieldType: "common",
    componentType: "textarea",
    label: "Guest Contact Information",
    helpText: "Phone number, email, and address",
    placeholder: "Enter contact details...",
    required: false
  },
  {
    id: "insuranceProvider",
    fieldType: "common",
    componentType: "text",
    label: "Insurance Provider",
    helpText: "Name of insurance company",
    placeholder: "e.g., State Farm",
    required: false
  },
  {
    id: "policyNumber",
    fieldType: "common",
    componentType: "text",
    label: "Policy Number",
    helpText: "Insurance policy number",
    placeholder: "Enter policy number",
    required: false
  },
  {
    id: "claimNumber",
    fieldType: "common",
    componentType: "text",
    label: "Claim Number",
    helpText: "Insurance claim reference number",
    placeholder: "Enter claim number",
    required: false
  },
  {
    id: "driversLicenseNumber",
    fieldType: "common",
    componentType: "text",
    label: "Driver's License Number",
    helpText: "Driver's license number if applicable",
    placeholder: "Enter license number",
    required: false
  },
  {
    id: "lawyerName",
    fieldType: "common",
    componentType: "text",
    label: "Lawyer / Representative Name",
    helpText: "Legal representative's name",
    placeholder: "Enter name",
    required: false
  },
  {
    id: "lawyerContact",
    fieldType: "common",
    componentType: "textarea",
    label: "Lawyer / Representative Contact",
    helpText: "Legal representative's contact information",
    placeholder: "Enter contact details...",
    required: false
  }
];

// Sign-off & Review fields
export const SIGNOFF_REVIEW_FIELDS: TemplateField[] = [
  {
    id: "reporterName",
    fieldType: "common",
    componentType: "text",
    label: "Reporter Name",
    helpText: "Name of the person filing this report",
    placeholder: "Enter your name",
    required: false
  },
  {
    id: "reporterRole",
    fieldType: "common",
    componentType: "text",
    label: "Reporter Role / Job Title",
    helpText: "Your role or job title",
    placeholder: "e.g., Safety Manager",
    required: false
  },
  {
    id: "supervisorName",
    fieldType: "common",
    componentType: "text",
    label: "Supervisor Name",
    helpText: "Name of reviewing supervisor",
    placeholder: "Enter supervisor name",
    required: false
  },
  {
    id: "supervisorReviewDate",
    fieldType: "common",
    componentType: "datetime",
    label: "Supervisor Review Date",
    helpText: "Date the supervisor reviewed this report",
    required: false
  },
  {
    id: "signoffAcknowledgement",
    fieldType: "common",
    componentType: "signature",
    label: "Sign-off / Acknowledgement",
    helpText: "Digital signature acknowledging review and accuracy",
    required: false
  }
];

// Diagrams & Sketches fields (special visualization types)
export const DIAGRAMS_SKETCHES_FIELDS: TemplateField[] = [
  {
    id: "bodyDiagram",
    fieldType: "common",
    componentType: "bodyDiagram",
    label: "Body Diagram",
    helpText: "Mark the affected body parts on the diagram",
    required: false
  },
  {
    id: "sceneDiagram",
    fieldType: "common",
    componentType: "sceneDiagram",
    label: "Scene / Crossroads Diagram",
    helpText: "Sketch the scene layout or crossroads where the incident occurred",
    required: false
  },
  {
    id: "sketch",
    fieldType: "common",
    componentType: "sketch",
    label: "Sketch / Drawing",
    helpText: "Add a custom sketch or drawing",
    required: false
  }
];

// Legacy export for backward compatibility (combines Incident Details fields)
export const COMMON_SAFETY_FIELDS = INCIDENT_DETAILS_FIELDS;





