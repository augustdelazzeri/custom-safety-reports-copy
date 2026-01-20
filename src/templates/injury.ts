import type { TemplateVersion } from "../schemas/types";

const injuryTemplate: TemplateVersion = {
  id: "tmpl_injury_v1",
  name: "Injury Report",
  createdAt: new Date().toISOString(),
  system: {
    title: { id: "title", label: "Title", type: "text", required: true, helpText: "Briefly describe what happened", placeholder: "Brief description of what happened" },
    dateTime: { id: "dateTime", label: "Date and Time", type: "dateTime", required: true, helpText: "When did the safety event occur?" },
    type: {
      id: "type",
      label: "Report Type",
      type: "dropdown",
      options: ["Incident", "Near Miss", "Observation", "Customer Incident"],
      required: true,
      helpText: "An event is an event that caused injury or damage. A near miss is an event that could have caused injury or damage but didn't. An observation is an event that did not cause injury or damage. A customer event involves a customer in a safety-related event."
    },
    location: { id: "location", label: "Location", type: "text", required: false, helpText: "Specific area, building, or equipment where the safety event occurred" },
    description: { id: "description", label: "Description", type: "textarea", required: true }
  },
  fields: [
    { id: "hazard", label: "Hazard Category", type: "dropdown", options: ["Chemical", "Electrical", "Ergonomic", "Fall", "Fire", "Mechanical"], helpText: "Examples: Chemical, Electrical, Ergonomic, Fall, Fire, Mechanical", placeholder: "Select hazard category" },
    { id: "severity", label: "Severity Level", type: "dropdown", options: ["Low", "Medium", "High"], helpText: "How serious was this safety event or how serious could it have been?", placeholder: "Select severity" },
    { id: "descriptionDetail", label: "Description", type: "textarea", required: false, helpText: "Provide a detailed account of what happened, what led to the event, who was involved, and any relevant circumstances", placeholder: "Describe what happened in detail" },
    { id: "immediateActions", label: "Immediate Actions Taken", type: "textarea", required: false, helpText: "Describe any immediate steps taken to address the situation, treat injuries, or prevent further harm", placeholder: "What actions were taken immediately after the safety event?" },
    { id: "photos", label: "Add a photo, video, or document (optional)", type: "file", validation: { fileTypes: ["image/*", "video/*", "application/pdf"], maxBytes: 104857600 }, helpText: "Upload supporting media or documentation to help capture what happened" },
    { id: "teamMembers", label: "Team Members to Notify", type: "text", required: false, helpText: "Select team members who should be notified about this safety event update.", placeholder: "Select team members to notify" },
    { id: "witnesses", label: "Witnesses", type: "textarea", required: false, helpText: "Add witnesses who saw or were involved in the incident", placeholder: "Add witness information" },
    { id: "injuryType", label: "Injury Type", type: "dropdown", options: ["Sprain", "Laceration", "Fracture", "Burn"], visible: false },
    { id: "bodyPart", label: "Body Part Affected", type: "multiselect", options: ["Head","Arm","Hand","Back","Leg","Foot"], visible: false },
    { id: "ppeUsed", label: "PPE Worn?", type: "checkbox", visible: false },
    { id: "medical", label: "Medical Attention Required?", type: "boolean", visible: false },
    { id: "hospital", label: "Hospital Name", type: "text", visible: false },
    { id: "signature", label: "Reporter Signature", type: "signature", visible: false }
  ],
  logic: [
    {
      id: "l1",
      when: [{ fieldId: "medical", op: "eq", value: true }],
      then: [
        { action: "show", targetId: "hospital" },
        { action: "require", targetId: "hospital" }
      ]
    },
    {
      id: "l2",
      when: [{ fieldId: "severity", op: "eq", value: "High" }],
      then: [{ action: "require", targetId: "photos" }]
    }
  ]
};

export default injuryTemplate;

