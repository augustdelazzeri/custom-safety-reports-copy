"use client";

import { NextActions, RecordChain, StatusPill, UpdatesFeed, WoPill } from "@/components/three-cases/event-flow";
import { PageShell } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS, CONTROL_LABEL, person } from "@/lib/three-cases/data";
import { ArrowLeft, ClipboardCheck, Play, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

/**
 * A CAPA or a work order created by an event flow. Same header and sections as the record pages
 * in production, trimmed to what the flow needs: status, links, actions and updates.
 */
export default function RecordPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const router = useRouter();
  const { flows, hydrated, advanceWo } = useThreeCases();
  const ev = EVENTS.find((e) => flows[e.id]?.capaRef === ref || flows[e.id]?.wos.some((w) => w.ref === ref));
  const flow = ev ? flows[ev.id] : undefined;
  const wo = flow?.wos.find((w) => w.ref === ref);
  const isCapa = Boolean(flow && flow.capaRef === ref);

  if (!hydrated) return <PageShell title="Record">{null}</PageShell>;

  if (!ev || !flow) {
    return (
      <PageShell title="Record">
        <div className="mx-auto max-w-xl rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          {ref} is created when the flow runs.{" "}
          <Link href="/inbox" className="font-medium text-indigo-700 hover:underline">
            Back to the Inbox
          </Link>
        </div>
      </PageShell>
    );
  }

  const owner = person(ev.capaDefaults?.ownerId ?? "dan");
  const actions = [...ev.options.filter((o) => flow.selectedOptionIds.includes(o.id)).map((o) => ({ title: o.title, tag: CONTROL_LABEL[o.controlLevel] })), ...flow.customActions.map((c) => ({ title: c, tag: "Added" }))];

  return (
    <PageShell title={isCapa ? "CAPAs" : "Safety Work Orders"} mainClassName="p-4 md:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <button onClick={() => router.back()} className="inline-flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isCapa ? <ClipboardCheck className="size-4" /> : <Wrench className="size-4" />}
              <span className="font-mono">{ref}</span>
              {isCapa ? <span>· {ev.capaDefaults?.type} · {ev.capaDefaults?.priority} priority</span> : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{isCapa ? `Corrective action: ${ev.title}` : wo?.title}</h1>
              {isCapa && flow.capaStatus ? <StatusPill status={flow.capaStatus} /> : wo ? <WoPill status={wo.status} /> : null}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isCapa ? `Owner ${owner.name} · due ${ev.capaDefaults?.due}` : `Assigned to ${person(wo?.assigneeId ?? "dan").name} · due ${wo?.due}`} · from{" "}
              <Link href={`/events/${ev.id}`} className="font-mono text-indigo-700 hover:underline">
                {ev.ref}
              </Link>
              {!isCapa && flow.capaRef ? (
                <>
                  {" "}
                  and{" "}
                  <Link href={`/events/records/${flow.capaRef}`} className="font-mono text-indigo-700 hover:underline">
                    {flow.capaRef}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          {!isCapa && wo && wo.status !== "complete" ? (
            <button
              onClick={() => advanceWo(ev.id, wo.ref)}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              <Play className="size-4" /> {wo.status === "open" ? "Start work" : "Mark complete"}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {isCapa ? (
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">Actions</h2>
                <ul className="space-y-1.5">
                  {actions.map((a) => (
                    <li key={a.title} className="flex items-center justify-between gap-3 text-sm text-gray-800">
                      {a.title}
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">{a.tag}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">Status changes</h2>
                Every status change on this work order goes to {owner.name}, owner of {flow.capaRef}. When the last work order of the CAPA is complete, the CAPA
                goes back to {owner.name.split(" ")[0]} to review. The event can close before that.
              </section>
            )}
            {isCapa ? (
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <NextActions ev={ev} flow={flow} />
              </section>
            ) : null}
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <UpdatesFeed ev={ev} flow={isCapa ? flow : { ...flow, updates: flow.updates.filter((u) => u.text.includes(ref)) }} />
            </section>
          </div>
          <aside>
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Linked records</h2>
              <RecordChain ev={ev} flow={flow} dense />
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
