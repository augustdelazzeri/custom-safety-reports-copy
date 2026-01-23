/**
 * OSHA Establishments Mock Data
 * 
 * Flat list of OSHA-registered establishments for location scoping.
 * Used in Custom Roles to restrict which establishments a user can access.
 */

export interface OSHAEstablishment {
  id: string;
  name: string;
  city: string;
  state: string;
  establishmentNumber?: string;
}

export const mockOSHAEstablishments: OSHAEstablishment[] = [
  {
    id: "osha_toronto",
    name: "Toronto Distribution Center",
    city: "Toronto",
    state: "ON",
    establishmentNumber: "1234567"
  },
  {
    id: "osha_atlanta",
    name: "Atlanta Manufacturing",
    city: "Atlanta",
    state: "GA",
    establishmentNumber: "2345678"
  },
  {
    id: "osha_chicago",
    name: "Chicago Plant",
    city: "Chicago",
    state: "IL",
    establishmentNumber: "3456789"
  },
  {
    id: "osha_houston",
    name: "Houston Facility",
    city: "Houston",
    state: "TX",
    establishmentNumber: "4567890"
  },
  {
    id: "osha_austin",
    name: "Austin Technology Center",
    city: "Austin",
    state: "TX",
    establishmentNumber: "5678901"
  },
  {
    id: "osha_seattle",
    name: "Seattle Warehouse",
    city: "Seattle",
    state: "WA",
    establishmentNumber: "6789012"
  },
  {
    id: "osha_phoenix",
    name: "Phoenix Distribution Hub",
    city: "Phoenix",
    state: "AZ",
    establishmentNumber: "7890123"
  }
];
