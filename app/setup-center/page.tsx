"use client";

import {
  SettingsTabs,
  SettingsTabsContent,
  SettingsTabsList,
  SettingsTabsTrigger,
} from '@/components/settings/settings-tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/contexts/app-context';
import { usePermissions } from '@/hooks/use-permissions';
import { matchesSettingsTabPath, SETTINGS_TABS } from '@/lib/settings-tabs-config';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Settings() {
  const router = useRouter();
  const pathname = usePathname();
  const { isUsCompany } = useAppContext();
  const { hasPermission } = usePermissions();

  const visibleTabs = SETTINGS_TABS.filter((tab) => (tab as any).isVisible({ hasPermission, isUsCompany }));

  const activeTab = visibleTabs.find((tab) => matchesSettingsTabPath(pathname, tab)) ?? visibleTabs[0];

  const handleTabChange = (value: string) => {
    const next = visibleTabs.find((tab) => tab.id === value);
    if (next && next.id !== activeTab.id) {
      router.push(next.route);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-[var(--spacing-sidebar)]">
        <Header />
        <main className="container mx-auto space-y-6 px-4 py-6 md:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your organization settings and preferences</p>
          </div>
          <SettingsTabs value={activeTab.id} onValueChange={handleTabChange}>
            <SettingsTabsList>
              {visibleTabs.map((tab) => (
                <SettingsTabsTrigger key={tab.id} value={tab.id} className="cursor-pointer gap-2">
                  <tab.icon className="size-4" aria-hidden="true" />
                  {tab.labelKey}
                </SettingsTabsTrigger>
              ))}
            </SettingsTabsList>

            {visibleTabs.map((tab) => {
              const TabComponent = tab.component;
              return (
                <SettingsTabsContent key={tab.id} value={tab.id} className="mt-6">
                  <TabComponent />
                </SettingsTabsContent>
              );
            })}
          </SettingsTabs>
        </main>
      </div>
    </div>
  );
}
