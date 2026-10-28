"use client";

/** A1 and A2 are the same screen; A2 also lets the person create the work order where the artifact has none. */

import { RdPage } from "@/components/redesign/ui";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { applyFilters, buildArtifacts, defaultFilters, useInboxStore, type Filters, type WoView, type Artifact } from "@/lib/screens/inbox";
import { useMvpStore } from "@/lib/three-cases/mvp-rules";
import { useEffect, useMemo, useState } from "react";
import { ArtifactDetail, type Variant } from "./detail";
import { ArtifactFilters, ArtifactList } from "./list";

const LOCATION_KEY = "ehs-prototype-inbox-location";

export function InboxScreen({ variant }: { variant: Variant }) {
  const { flows, advanceWo, closeEvent, closeCapa } = useThreeCases();
  const mvp = useMvpStore();
  const store = useInboxStore();
  const defaults = useMemo(() => defaultFilters(variant === "a1" ? "with" : "all"), [variant]);
  const [filters, setFilters] = useState<Filters>(defaults);
  const [selectedId, setSelectedId] = useState<string>();

  // A person from one location keeps seeing only theirs: the choice is remembered.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCATION_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved location once after mount
      if (saved) setFilters((f) => ({ ...f, location: saved }));
    } catch {
      // Blocked storage: the filter still works, it is just not remembered.
    }
  }, []);
  const change = (f: Filters) => {
    setFilters(f);
    try {
      window.localStorage.setItem(LOCATION_KEY, f.location);
    } catch {
      // Ignore.
    }
  };

  const all = useMemo(() => buildArtifacts(flows, mvp.wos, store.data), [flows, mvp.wos, store.data]);
  const shown = useMemo(() => applyFilters(all, filters), [all, filters]);
  const selected = all.find((a) => a.id === selectedId) ?? shown[0];

  const complete = (wo: WoView) => {
    store.setStatus(wo.key, "complete", "Completed the work order");
    // The event flow keeps its own status; move it along so Events and Corrective actions agree.
    if (wo.origin === "flow" && wo.eventId) {
      const steps = wo.baseStatus === "open" ? 2 : wo.baseStatus === "in_progress" ? 1 : 0;
      for (let i = 0; i < steps; i++) advanceWo(wo.eventId, wo.ref);
    }
  };
  const moveToDone = (a: Artifact) => {
    if (a.kind === "event" && a.eventId) closeEvent(a.eventId, "All its work orders are complete.");
    else if (a.kind === "capa" && a.flowCapa && a.eventId) closeCapa(a.eventId);
    store.closeArtifact(a.id);
  };

  const title = variant === "a1" ? "Work orders to close" : "Work orders to close";
  return (
    <PageShell
      title="Inbox"
      mainClassName="p-0 overflow-hidden"
      prototypeBar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
          <TapCompare today="28 clicks" todayDetail="measured on staging: event 6, CAPA 7, work order 4, OSHA form 11" here="2 clicks" />
        </div>
      }
    >
      <RdPage
        fill
        className="gap-3"
        title={title}
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(540px,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex min-h-0 flex-col gap-3">
            <ArtifactFilters filters={filters} onChange={change} all={all} shown={shown.length} defaults={{ ...defaults, location: filters.location }} />
            <ArtifactList items={shown} selectedId={selected?.id} onSelect={(a) => setSelectedId(a.id)} onReset={() => change(defaults)} />
          </div>
          <div className="min-h-0 overflow-hidden rounded-[var(--lab-radius)] border border-border">
            <ArtifactDetail artifact={selected} store={store} variant={variant} onComplete={complete} onMoveToDone={moveToDone} />
          </div>
        </div>
      </RdPage>
    </PageShell>
  );
}
