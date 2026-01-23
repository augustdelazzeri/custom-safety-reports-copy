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
  }
];
