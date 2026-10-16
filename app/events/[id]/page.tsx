"use client";

import { EventFlowPanel } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { Avatar, PageShell } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS, asset as getAsset, event as getEvent, locationName, person } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, FileDown, Image as ImageIcon, MapPin, MoreHorizontal, User, Wrench } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ev = getEvent(id);
  const { flows } = useThreeCases();

  if (!ev) {
    return (
      <PageShell title="Event">
        <p className="text-sm text-gray-500">Event not found.</p>
      </PageShell>
    );
  }

  const flow = flows[ev.id];
  const a = ev.assetId ? getAsset(ev.assetId) : undefined;
  const idx = EVENTS.findIndex((e) => e.id === ev.id);
  const prev = EVENTS[(idx - 1 + EVENTS.length) % EVENTS.length];
  const next = EVENTS[(idx + 1) % EVENTS.length];
  const status = flow?.status === "open" ? "Open" : flow?.status === "in_review" ? "In review" : "Closed";

  return (
    <PageShell title="Events" mainClassName="p-4 md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Link href={`/events/${prev.id}`} className="rounded border border-gray-200 bg-white p-1 hover:bg-gray-50" aria-label="Previous event">
              <ChevronLeft className="size-4" />
            </Link>
            <span className="px-1">
              Event {idx + 1} of {EVENTS.length}
            </span>
            <Link href={`/events/${next.id}`} className="rounded border border-gray-200 bg-white p-1 hover:bg-gray-50" aria-label="Next event">
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Header, as in the event detail page in production */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href="/events" className="mb-1 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
              <ArrowLeft className="size-4" /> Events
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{ev.title}</h1>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", status === "Open" ? "bg-sky-50 text-sky-700" : status === "In review" ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-600")}>{status}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="font-mono">{ev.ref}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {ev.reportedAt}</span>
              <span className="inline-flex items-center gap-1"><User className="size-3.5" /> {ev.reportedBy}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"><FileDown className="size-4" /> Export PDF</button>
            <button className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-500" aria-label="More"><MoreHorizontal className="size-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Replaces today's "Take Action" card */}
            <section className="rounded-xl border-2 border-indigo-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Next steps · replaces the &quot;Take Action&quot; card</div>
              <EventFlowPanel eventId={ev.id} showHeader={false} />
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Description</h2>
              <p className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">{ev.description}</p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Media</h2>
              <div className="flex gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="flex h-20 w-28 items-center justify-center rounded-md bg-gradient-to-br from-slate-200 to-slate-400 text-white">
                    <ImageIcon className="size-5" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Location and assets</h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2"><MapPin className="size-4 text-gray-400" /> {locationName(ev.locationId)}</div>
                {a ? (
                  <div className="flex items-center gap-2"><Wrench className="size-4 text-gray-400" /> {a.code} {a.name}</div>
                ) : null}
              </div>
              {a ? (
                <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Recent work orders on this asset</div>
                  {a.lastWorkOrders.map((wo) => (
                    <div key={wo.ref} className="text-xs text-gray-600">
                      {wo.ref} · {wo.title} · {wo.date}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Notified team members</h2>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Avatar initials={person("maria").initials} /> {person("maria").name}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Timeline</h2>
              <ol className="space-y-2 text-xs text-gray-600">
                <li>{ev.reportedAt} · Reported by {ev.reportedBy}</li>
                <li>{ev.reportedAt} · AI triage: {ev.aiRecommendation}</li>
                {flow?.updates.map((u, i) => (
                  <li key={i}>
                    {u.at} · {u.text}
                  </li>
                ))}
                {flow?.status === "closed" && !flow.capaRef ? <li>Now · Closed. {flow.closedNote}</li> : null}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
