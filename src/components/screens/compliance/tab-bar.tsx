"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENCY_REPORTS, useOshaLog } from "@/lib/screens/compliance";
import { useRouter } from "next/navigation";

export type ComplianceTab = "osha" | "summary" | "agency" | "calendar";

/**
 * The Compliance title and tab bar, for a page that lives outside /compliance (the calendar at
 * /compliance-calendar): the same H1, subtitle and underline tabs as RdTabs, each tab a link
 * back into /compliance. Drop it at the top of the page with `active="calendar"`.
 */
export function ComplianceTabBar({ active, actions }: { active: ComplianceTab; actions?: React.ReactNode }) {
  const router = useRouter();
  const { cases, empty } = useOshaLog();
  const tabs: { key: ComplianceTab; label: string; count?: number }[] = [
    { key: "osha", label: "OSHA log", count: empty ? 0 : cases.length },
    { key: "summary", label: "Summary (300A)" },
    { key: "agency", label: "Agency reports", count: empty ? 0 : AGENCY_REPORTS.length },
    { key: "calendar", label: "Calendar" },
  ];
  const go = (key: string) => {
    if (key === active) return;
    router.push(key === "calendar" ? "/compliance-calendar" : `/compliance?tab=${key}`);
  };

  return (
    <div className="flex shrink-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl leading-8 font-bold text-foreground">Compliance</h1>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">What the regulator sees, and what is coming due.</p>
      <Tabs value={active} onValueChange={go} className="mt-6">
        <TabsList className="h-auto w-full items-stretch justify-start gap-2 overflow-x-auto overflow-y-hidden rounded-none border-b border-sidebar-border bg-transparent p-0 pt-4">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="group h-7 flex-none gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 font-normal text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-badge-accent-foreground data-[state=active]:shadow-none"
            >
              {tab.label}
              {tab.count !== undefined ? (
                <Badge className="h-5 rounded-full bg-badge-neutral px-2 py-0 text-xs font-medium text-badge-neutral-foreground tabular-nums group-data-[state=active]:bg-badge-accent group-data-[state=active]:text-badge-accent-foreground">
                  {tab.count}
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
