import { LayoutDashboard, MapPin, TriangleAlert, Building, Users, Shield } from 'lucide-react';

export const SafetyTemplatesTab = () => <div>Safety Templates Tab Mock</div>;
export const OshaLocationsTab = () => <div>OSHA Locations Tab Mock</div>;
export const HazardsAndControlsTab = () => <div>Hazards and Controls Tab Mock</div>;
export const CompanyTab = () => <div>Company Tab Mock</div>;
export const PermissionsTab = () => <div>Permissions Tab Mock</div>;
export const PrivacyTab = () => <div>Privacy Tab Mock</div>;

export const SETTINGS_TABS = [
  {
    id: 'safety-templates',
    route: '/settings/safety-templates',
    icon: LayoutDashboard,
    labelKey: 'Safety Templates',
    component: SafetyTemplatesTab,
    isVisible: () => true,
  },
  {
    id: 'osha-locations',
    route: '/settings/osha-locations',
    icon: MapPin,
    labelKey: 'OSHA Locations',
    component: OshaLocationsTab,
    isVisible: () => true,
  },
  {
    id: 'hazards-and-controls',
    route: '/settings/hazards-and-controls',
    icon: TriangleAlert,
    labelKey: 'Hazards & Controls',
    component: HazardsAndControlsTab,
    isVisible: () => true,
  },
  {
    id: 'company',
    route: '/setup-center',
    icon: Building,
    labelKey: 'Company',
    component: CompanyTab,
    isVisible: () => true,
  },
  {
    id: 'permissions',
    route: '/settings/people',
    icon: Users,
    labelKey: 'People & Permissions',
    component: PermissionsTab,
    isVisible: () => true,
  },
  {
    id: 'privacy',
    route: '/settings/privacy',
    icon: Shield,
    labelKey: 'Privacy',
    component: PrivacyTab,
    isVisible: () => true,
  },
];

export const matchesSettingsTabPath = (currentPath: string, tab: any): boolean =>
  currentPath === tab.route || currentPath.startsWith(`${tab.route}/`);
