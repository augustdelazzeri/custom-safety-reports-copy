export const REPORT_TYPE_MAP = {
  incident: 'Incident',
  near_miss: 'Near Miss',
  observation: 'Observation',
  customer_incident: 'Customer Incident',
};

export const SEVERITY_MAP = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const reportTypeEnum = {
  enumValues: ['incident', 'near_miss', 'observation', 'customer_incident'],
};

export const severityEnum = {
  enumValues: ['low', 'medium', 'high', 'critical'],
};

export const statusEnum = {
  enumValues: ['open', 'in_review', 'closed'],
};

export const capaPriorityEnum = {
  enumValues: ['high', 'medium', 'low'],
};

export const STATUS_MAP = {
  open: 'Open',
  in_review: 'In Review',
  closed: 'Closed',
};

export const CAPA_PRIORITY_MAP = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
