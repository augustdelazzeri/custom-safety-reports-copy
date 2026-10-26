"use client";

import { RdPage } from "@/components/redesign/ui";
import { InboxNova, usualReady } from "@/components/three-cases/inbox-nova";
import { NovaBall } from "@/components/three-cases/nova-panel";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { SOURCE_TABS, SourceDetail, SourceQueue } from "@/components/three-cases/source-queue";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { useMvpStore } from "@/lib/three-cases/mvp-rules";
import { buildSources, type SourceKind } from "@/lib/three-cases/sources";
import { useEffect, useMemo, useState } from "react";

const KINDS = SOURCE_TABS.map((t) => t.key);

/**
 * A1 · A variation of A. On the left, instead of the Inbox, the lists the work comes from: events,
 * CAPAs, safety work orders and documents, one at a time. Each list is short and calm (no columns):
 * open only, the one due first on top. The right side is A's: the event's flow, or the record.
 */
export default function A1Page() {
  const { flows } = useThreeCases();
  const mvp = useMvpStore();
  const lists = useMemo(() => buildSources(flows, mvp.wos), [flows, mvp.wos]);
  const [kind, setKind] = useState<SourceKind>("event");
  const [openOnly, setOpenOnly] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [novaOpen, setNovaOpen] = useState(false);
  const ready = usualReady(flows);

  // The open list lives in the address (?list=), so a link lands on it.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("list");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once after mount
    if (fromUrl && (KINDS as string[]).includes(fromUrl)) setKind(fromUrl as SourceKind);
  }, []);
  const chooseKind = (k: SourceKind) => {
    setKind(k);
    setSelectedId(undefined);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("list", k);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // The list still changes; only the address does not follow.
    }
  };

  const tab = SOURCE_TABS.find((t) => t.key === kind)!;
  const shown = openOnly ? lists[kind].filter((i) => i.open) : lists[kind];
  const selected = shown.find((i) => i.id === selectedId) ?? shown[0];

  return (
    <PageShell
      title={tab.title}
      mainClassName="p-0 overflow-hidden"
      aside={novaOpen ? <InboxNova onClose={() => setNovaOpen(false)} className="w-[400px]" /> : null}
      prototypeBar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
          <TapCompare today="28 clicks" todayDetail="measured on staging: event 6, CAPA 7, work order 4, OSHA form 11" here="2 clicks" />
        </div>
      }
    >
      <RdPage
        fill
        title={tab.title}
        subtitle={tab.hint}
        actions={
          !novaOpen ? (
            <Button variant="outline" onClick={() => setNovaOpen(true)} className="gap-2">
              <NovaBall /> Nova did 3 things{ready ? ` · ${ready} flow${ready > 1 ? "s" : ""} ready` : ""}
            </Button>
          ) : null
        }
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
          <SourceQueue kind={kind} onKind={chooseKind} lists={lists} openOnly={openOnly} onOpenOnly={setOpenOnly} selectedId={selected?.id} onSelect={(i) => setSelectedId(i.id)} />
          <div className="min-h-0 overflow-y-auto rounded-[var(--lab-radius)] border border-border">
            <SourceDetail item={selected} />
          </div>
        </div>
      </RdPage>
    </PageShell>
  );
}
