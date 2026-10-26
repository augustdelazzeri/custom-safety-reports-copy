"use client";

/**
 * Settings, as in Thiago's redesign (safety-redesign src/lab/pages/lab-settings.tsx): one page,
 * the six areas as tabs (`?tab=`), each part of a tab as a segment (`?subtab=`). People &
 * permissions and Company are drawn for real; Forms, OSHA locations, Hazards & controls and
 * Privacy are placeholders in the same design system (Kaue: low relevance, one coherent screen).
 * The old pages under /settings/* stay as they are and are not linked from here.
 */

import { RdPage, RdTabs } from "@/components/redesign/ui";
import { CompanyTab } from "@/components/screens/settings/company";
import { PeopleTab } from "@/components/screens/settings/people";
import { PlaceholderCard, SettingsPane, SoonPrimary } from "@/components/screens/settings/shared";
import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { PageShell } from "@/components/three-cases/shell";
import { useDataMode } from "@/lib/three-cases/demo-data";
import {
  ACTIVE_FRAMEWORKS,
  AI_INSTRUCTIONS,
  NEW_ACCOUNT_PROFILE,
  NEW_ACCOUNT_USERS,
  PLACEHOLDERS,
  PROFILE,
  SETTINGS_TABS,
  USERS,
  type SettingsTabKey,
} from "@/lib/screens/settings";
import type { ReactNode } from "react";

/** A new tab opens on its first part. */
function clearSubtab() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("subtab");
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // The tab still changes; only the address keeps the old part.
  }
}

export default function SettingsPage() {
  const [mode] = useDataMode();
  const fresh = mode === "new";

  const render = (key: SettingsTabKey, title: string, about: string): ReactNode => {
    if (key === "people") return <PeopleTab key={mode} title={title} description={about} initialUsers={fresh ? NEW_ACCOUNT_USERS : USERS} />;
    if (key === "company")
      return (
        <CompanyTab
          key={mode}
          title={title}
          description={about}
          profile={fresh ? NEW_ACCOUNT_PROFILE : PROFILE}
          frameworks={fresh ? [] : ACTIVE_FRAMEWORKS}
          aiInstructions={fresh ? "" : AI_INSTRUCTIONS}
        />
      );
    const spec = PLACEHOLDERS[key];
    return (
      <SettingsPane title={title} description={about} action={spec.action ? <SoonPrimary label={spec.action} /> : undefined}>
        <PlaceholderCard spec={spec} />
      </SettingsPane>
    );
  };

  return (
    <PageShell title="Settings" mainClassName="p-0" prototypeBar={<DataModeSwitch />}>
      <RdPage title="Settings" subtitle="How Safety behaves for everyone in this company.">
        <RdTabs tabs={SETTINGS_TABS.map((t) => ({ key: t.key, label: t.label, render: () => render(t.key, t.label, t.about) }))} onChange={clearSubtab} />
      </RdPage>
    </PageShell>
  );
}
