"use client";

import { RdEmptyState, RdPage, RdTabs, figmaButton } from "@/components/redesign/ui";
import { AgencyReports } from "@/components/screens/compliance/agency";
import { FILTER_LABEL, OshaLog, type CaseFilter } from "@/components/screens/compliance/osha-log";
import { Summary } from "@/components/screens/compliance/summary";
import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { AGENCY_REPORTS, useOshaLog } from "@/lib/screens/compliance";
import { CalendarDays, Plus, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TabKey = "osha" | "summary" | "agency" | "calendar";
const KEYS: TabKey[] = ["osha", "summary", "agency", "calendar"];
const isKey = (v: string | null): v is TabKey => KEYS.includes(v as TabKey);
const isFilter = (v: string | null): v is CaseFilter => Boolean(v && v in FILTER_LABEL);

/** Writes the open tab (and the log's filter) into the address without a navigation, like RdTabs does. */
function writeUrl(tab: TabKey, cases?: CaseFilter | null) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    if (cases) url.searchParams.set("cases", cases);
    else url.searchParams.delete("cases");
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // The page still changes; only the address does not follow.
  }
}

/**
 * Compliance, as in Thiago's redesign (lab-compliance.tsx): the OSHA log, the Form 300A, the
 * agency reports and the calendar are tabs of one page. The calendar keeps its own page
 * (/compliance-calendar, use case 2 with Nova), so its tab takes the person there.
 */
export default function CompliancePage() {
  const router = useRouter();
  const { cases, empty } = useOshaLog();
  const [active, setActive] = useState<TabKey>("osha");
  const [caseFilter, setCaseFilter] = useState<CaseFilter | null>(null);
  const [summaryYear, setSummaryYear] = useState<"2026" | "2025">("2026");
  /** Bumped to remount the tabs after the page changes the tab itself (RdTabs reads the address on mount). */
  const [tabsKey, setTabsKey] = useState(0);
  const lastTab = useRef<TabKey>("osha");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    // A link to the calendar tab lands on the calendar page, without leaving a step in history.
    if (tab === "calendar") {
      writeUrl("osha");
      router.replace("/compliance-calendar");
      return;
    }
    if (isKey(tab)) {
      lastTab.current = tab;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once after mount
      setActive(tab);
    }
    const cases = params.get("cases");
    if (isFilter(cases)) setCaseFilter(cases);
  }, [router]);

  const goTo = (tab: TabKey, cases: CaseFilter | null = null) => {
    writeUrl(tab, cases);
    lastTab.current = tab;
    setActive(tab);
    setCaseFilter(cases);
    setTabsKey((k) => k + 1);
  };

  const onTab = (key: string) => {
    if (!isKey(key)) return;
    if (key === "calendar") {
      // Back from the calendar returns to the tab the person was on, not to this hand-off.
      writeUrl(lastTab.current, caseFilter);
      router.push("/compliance-calendar");
      return;
    }
    lastTab.current = key;
    setActive(key);
    if (caseFilter) {
      setCaseFilter(null);
      writeUrl(key, null);
    }
  };

  const action =
    active === "summary" ? (
      <Button type="button" className="gap-2" title="Prints the Form 300A (not part of this prototype)">
        <Printer className="size-4" /> Print 300A
      </Button>
    ) : active === "agency" ? (
      <Button type="button" className="gap-2" title="Opens the severe injury report (not part of this prototype)">
        <Plus className="size-4" /> Report a severe injury
      </Button>
    ) : (
      <Button type="button" className="gap-2" title="Opens the Form 300 entry (not part of this prototype)">
        <Plus className="size-4" /> Add a case
      </Button>
    );

  return (
    <PageShell
      title="Compliance"
      mainClassName="p-0"
      prototypeBar={
        <div className="flex flex-wrap items-center gap-2">
          <DataModeSwitch />
          <p className="px-1 text-xs text-muted-foreground">Thiago&apos;s Compliance page: the OSHA log, the 300A, agency reports and the calendar are tabs of one page. EVT-2041 becomes case 2026-014.</p>
        </div>
      }
    >
      <RdPage title="Compliance" subtitle="What the regulator sees, and what is coming due." actions={action}>
        <RdTabs
          key={tabsKey}
          fallback={active}
          onChange={onTab}
          tabs={[
            {
              key: "osha",
              label: "OSHA log",
              count: empty ? 0 : cases.length,
              render: () => (
                <OshaLog
                  caseFilter={caseFilter}
                  onClearFilter={() => {
                    setCaseFilter(null);
                    writeUrl("osha", null);
                  }}
                  onOpenSummary={() => {
                    setSummaryYear("2025");
                    goTo("summary");
                  }}
                />
              ),
            },
            { key: "summary", label: "Summary (300A)", render: () => <Summary year={summaryYear} onYear={setSummaryYear} onOpenLog={(f) => goTo("osha", f)} /> },
            {
              key: "agency",
              label: "Agency reports",
              count: empty ? 0 : AGENCY_REPORTS.length,
              render: () => (
                <AgencyReports
                  onOpenSummary={(y) => {
                    setSummaryYear(y);
                    goTo("summary");
                  }}
                />
              ),
            },
            {
              key: "calendar",
              label: "Calendar",
              render: () => (
                <RdEmptyState
                  icon={CalendarDays}
                  title="The calendar has its own page"
                  body="Scheduled obligations, inspections and training, with Nova to plan them."
                  action={
                    <Button type="button" size="sm" className={figmaButton} onClick={() => router.push("/compliance-calendar")}>
                      Open the calendar
                    </Button>
                  }
                />
              ),
            },
          ]}
        />
      </RdPage>
    </PageShell>
  );
}
