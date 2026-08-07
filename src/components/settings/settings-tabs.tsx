"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  ClipboardList, 
  MapPin, 
  Activity, 
  Building2, 
  Users, 
  Lock 
} from "lucide-react";

export const SettingsTabs = () => {
  const pathname = usePathname();

  const tabs = [
    { label: "Safety Templates", href: "/settings/safety-templates", icon: <ClipboardList className="size-3.5" /> },
    { label: "OSHA Locations", href: "/settings/osha-locations", icon: <MapPin className="size-3.5" /> },
    { label: "Hazards & Control Measures", href: "/settings/hazards-and-controls", icon: <Activity className="size-3.5" /> },
    { label: "Company", href: "/company-metadata", icon: <Building2 className="size-3.5" /> },
    { label: "People & Permissions", href: "/settings/people", icon: <Users className="size-3.5" /> },
    { label: "Privacy", href: "/settings/privacy", icon: <Lock className="size-3.5" /> },
  ];

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-1 py-3 text-xs font-bold transition-all border-b-2",
                isActive 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
