"use client";

import { NovaBall } from "@/components/three-cases/nova-panel";
import { CASE_B_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { ASSETS, asset as getAsset, job as getJob, jobsForAsset, locationName, person } from "@/lib/three-cases/data";
import type { Asset, ExecutionJob } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUp,
  Camera,
  Check,
  ChevronLeft,
  ClipboardCheck,
  FileCheck,
  HardHat,
  Loader2,
  Megaphone,
  Mic,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type Screen = "scan" | "home" | "precheck" | "run" | "done" | "nova";
type Tab = "work" | "report" | "docs";
type ItemState = { done: boolean; failed?: boolean; photo?: "checking" | "ok" };

const HAZARDS: Record<string, string[]> = {
  fl03: ["Battery acid splash when disconnecting", "Slippery floor from degreaser", "Mast can drop if forks are raised"],
  hp04: ["Stored hydraulic energy in the accumulator", "Ram can drift down without the block", "Pinch points at the die"],
  cv12: ["Unexpected start-up", "Nip points at the pulleys", "Loose clothing caught in the belt"],
};

const PPE: Record<string, string[]> = {
  fl03: ["Goggles", "Nitrile gloves", "Safety shoes"],
  hp04: ["Safety glasses", "Cut gloves", "Personal lock"],
  cv12: ["Safety glasses", "Personal lock", "No loose clothing"],
};

function MobileInner() {
  const params = useSearchParams();
  const { executions, updateExecution } = useThreeCases();
  const fromWo = executions.find((e) => e.id === params.get("wo"));
  const initialAsset = params.get("asset") ?? (fromWo ? getJob(fromWo.jobId)?.assetId : undefined) ?? "fl03";
  const [assetId, setAssetId] = useState(initialAsset);
  // Opens on the camera: Scan in Safety reads the QR the CMMS already prints for the asset.
  const [screen, setScreen] = useState<Screen>(fromWo ? "precheck" : "scan");
  const [tab, setTab] = useState<Tab>("work");
  const [jobId, setJobId] = useState<string | null>(fromWo?.jobId ?? null);
  const [ack, setAck] = useState(false);
  const [permitAsked, setPermitAsked] = useState(false);
  const [items, setItems] = useState<Record<number, ItemState>>({});

  useEffect(() => {
    if (fromWo) {
      setAssetId(getJob(fromWo.jobId)?.assetId ?? "fl03");
      setJobId(fromWo.jobId);
      setScreen("precheck");
    }
  }, [fromWo]);

  const a = getAsset(assetId)!;
  const job: ExecutionJob | undefined = jobId ? getJob(jobId) : undefined;
  const jobs = jobsForAsset(assetId);
  const isInspection = job?.verb === "Inspect";
  const needsPermit = Boolean(job?.plan.some((p) => p.kind === "ptw"));
  const permitApproved = !needsPermit || fromWo?.permitStatus === "approved" || permitAsked;
  const checklist = fromWo && fromWo.jobId === jobId ? fromWo.checklist : job?.checklist ?? [];
  const doneCount = Object.values(items).filter((s) => s.done).length;
  const failed = Object.entries(items).filter(([, s]) => s.failed).map(([i]) => Number(i));
  const allDone = checklist.length > 0 && doneCount === checklist.length;

  const reset = (to: Screen = "home") => {
    setScreen(to);
    setAck(false);
    setItems({});
  };

  const setItem = (i: number, patch: Partial<ItemState>) => setItems((s) => ({ ...s, [i]: { ...(s[i] ?? { done: false }), ...patch } }));

  const takePhoto = (i: number) => {
    setItem(i, { photo: "checking" });
    setTimeout(() => setItem(i, { photo: "ok", done: true }), 900);
  };

  const finish = () => {
    if (fromWo) updateExecution(fromWo.id, { permitStatus: fromWo.permitStatus === "none" ? "none" : "approved" });
    setScreen("done");
  };

  return (
    <div className="mx-auto flex w-[380px] shrink-0 flex-col overflow-hidden rounded-[40px] border-[10px] border-gray-900 bg-card shadow-2xl" style={{ height: "min(760px, calc(100vh - 150px))" }}>
      <div className="flex items-center justify-between bg-foreground px-6 pb-1 pt-1 text-xs text-white">
        <span>9:41</span>
        <span className="h-5 w-24 rounded-full bg-black" />
        <span>5G</span>
      </div>

      {/* Asset header, visible once the QR is scanned */}
      {screen !== "scan" && screen !== "nova" ? (
        <>
          <div className="truncate bg-muted px-4 py-1 text-center font-mono text-xs text-muted-foreground">app.upkeep.com/ehs/assets/{a.code.toLowerCase()}</div>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            {screen !== "home" ? (
              <button onClick={() => reset(screen === "run" ? "precheck" : "home")} className="-ml-1 rounded p-1 text-muted-foreground" aria-label="Back">
                <ChevronLeft className="size-5" />
              </button>
            ) : (
              <QrCode className="size-5 text-text-placeholder" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {a.code} · {a.name}
              </div>
              <div className="text-xs text-muted-foreground">{locationName(a.locationId)} · Asset QR, scanned just now</div>
            </div>
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">CR</span>
          </div>
        </>
      ) : null}

      {screen === "nova" ? <MobileNova asset={a} onBack={() => setScreen("home")} /> : null}
      <div className={cn("flex-1 overflow-y-auto bg-gray-50/60", screen === "nova" && "hidden")}>
        {screen === "scan" ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 bg-foreground p-6 text-center">
            <p className="text-sm text-text-placeholder">Point the camera at the asset&apos;s QR</p>
            <div className="relative rounded-2xl border-2 border-white/80 p-3">
              <div className="w-48 rounded-xl bg-card p-3 text-left shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Wrench className="size-3" /> UpKeep asset
                </div>
                <QrCode className="mx-auto my-2 size-24 text-foreground" />
                <div className="text-xs font-semibold text-foreground">{a.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{a.code}</div>
              </div>
            </div>
            <button onClick={() => setScreen("home")} className="rounded-full bg-card px-5 py-2 text-sm font-semibold text-foreground">
              Scan
            </button>
            <p className="text-xs leading-relaxed text-text-placeholder">
              Safety opens the camera in the phone&apos;s browser, no app to install. It reads the QR the CMMS already prints for the asset and finds
              the asset by its barcode.
            </p>
          </div>
        ) : null}

        {screen === "home" ? (
          <div className="flex rounded-none border-b border-border bg-card px-2 text-sm">
            {(
              [
                ["work", "Work", true],
                ["report", "Report", false],
                ["docs", "Documents", false],
              ] as const
            ).map(([id, label, isNew]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 border-b-2 py-2.5 font-medium",
                  tab === id ? "border-indigo-600 text-badge-accent-foreground" : "border-transparent text-muted-foreground",
                )}
              >
                {label}
                {isNew ? <span className="rounded bg-indigo-100 px-1 text-[9px] font-bold uppercase text-badge-accent-foreground">New</span> : null}
              </button>
            ))}
          </div>
        ) : null}

        {screen === "home" && tab === "report" ? (
          <div className="space-y-3 p-4">
            <p className="text-lg font-semibold text-foreground">What happened?</p>
            <p className="text-xs text-muted-foreground">Today&apos;s event flow, with this asset already filled in.</p>
            <div className="flex min-h-24 items-start rounded-2xl border border-border bg-card p-3 text-sm text-text-placeholder">Speak or type, the AI fills the form</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground">
                <Mic className="size-4 text-badge-accent-foreground" /> Speak
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground">
                <Camera className="size-4 text-muted-foreground" /> Photo
              </button>
            </div>
          </div>
        ) : null}

        {screen === "home" && tab === "docs" ? (
          <div className="space-y-2 p-4">
            <p className="text-xs text-muted-foreground">Every Safety document of this asset: linked, or found by the AI by its title.</p>
            {a.docs.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-card px-3 py-2">
                <div className="font-mono text-xs text-muted-foreground">{d.ref}</div>
                <div className="text-sm text-foreground">{d.title}</div>
              </div>
            ))}
          </div>
        ) : null}

        {screen === "home" && tab === "work" ? (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-badge-accent px-2.5 py-1.5 text-xs text-indigo-800">
              <ShieldCheck className="size-3.5" /> Signed in as Carlos Rivera · work needs a login, reporting does not
            </div>
            {executions
              .filter((e) => getJob(e.jobId)?.assetId === assetId)
              .slice(0, 1)
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setJobId(e.jobId);
                    setScreen("precheck");
                  }}
                  className="w-full rounded-2xl border border-primary/40 bg-badge-accent p-3 text-left"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-badge-accent-foreground">Assigned to you</div>
                  <div className="text-sm font-semibold text-foreground">
                    {e.woRef} · {getJob(e.jobId)?.title}
                  </div>
                </button>
              ))}
            <div>
              <p className="text-lg font-semibold text-foreground">What are you doing on {a.name}?</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="size-3 text-badge-accent-foreground" /> From the {a.docs.length} documents of this asset
              </p>
            </div>
            {jobs.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setJobId(j.id);
                  setScreen("precheck");
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm active:scale-[0.99]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-badge-accent text-badge-accent-foreground">
                  {j.verb === "Inspect" ? <ClipboardCheck className="size-5" /> : <Wrench className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-foreground">{j.title.replace(new RegExp(`\\s+(on |of )?(the )?${a.name}$`), "")}</span>
                  <span className="block truncate text-xs text-muted-foreground">{j.reason}</span>
                </span>
                {j.id === "fl03-inspect" ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-badge-warning-foreground">Due today</span> : null}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTab("report")}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-left text-sm font-medium text-foreground"
              >
                <Megaphone className="size-4 text-badge-error-foreground" /> Report a problem
              </button>
              <button
                onClick={() => setScreen("nova")}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-left text-sm font-medium text-foreground"
              >
                <NovaBall /> Something else
              </button>
            </div>
          </div>
        ) : null}

        {screen === "precheck" && job ? (
          <div className="space-y-3 p-4">
            <p className="text-lg font-semibold text-foreground">{job.title}</p>
            <div className={cn("rounded-2xl border p-3", permitApproved ? "border-emerald-200 bg-badge-success" : "border-amber-200 bg-badge-warning")}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileCheck className={cn("size-4", permitApproved ? "text-badge-success-foreground" : "text-amber-700")} />
                {needsPermit ? (permitApproved ? "Permit approved" : "Permit not approved yet") : "No permit needed"}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {needsPermit
                  ? permitApproved
                    ? "Maria Lopez and Dan Brooks approved it. Valid until 11:00."
                    : "You can read everything now. The checklist unlocks when both approvers sign."
                  : "The SOP does not ask for one."}
              </p>
              {needsPermit && !permitApproved ? (
                <button onClick={() => setPermitAsked(true)} className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">
                  Ask Maria and Dan to approve now
                </button>
              ) : null}
            </div>
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="size-4 text-badge-warning-foreground" /> Hazards from the JHA
              </div>
              <ul className="mt-1.5 space-y-1 text-sm text-foreground">
                {(HAZARDS[assetId] ?? HAZARDS.fl03).map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(PPE[assetId] ?? PPE.fl03).map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                    <HardHat className="size-3" /> {p}
                  </span>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm text-foreground">
              <input id="ack-jha" type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="size-4 accent-[var(--indigo-9)]" />
              I read the hazards and I&apos;m wearing the PPE
            </label>
          </div>
        ) : null}

        {screen === "run" && job ? (
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{job.title}</p>
              <span className="text-xs text-muted-foreground">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-primary transition-all" style={{ width: `${(doneCount / Math.max(checklist.length, 1)) * 100}%` }} />
            </div>
            {checklist.map((step, i) => {
              const s = items[i] ?? { done: false };
              const needsPhoto = /photo|hoses|forks/i.test(step);
              return (
                <div key={step} className={cn("rounded-2xl border bg-card p-3", s.failed ? "border-rose-300" : s.done ? "border-emerald-200" : "border-border")}>
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold", s.done ? (s.failed ? "bg-destructive text-white" : "bg-emerald-600 text-white") : "bg-muted text-muted-foreground")}>
                      {s.done ? s.failed ? <X className="size-3" /> : <Check className="size-3" /> : i + 1}
                    </span>
                    <span className="flex-1 text-sm text-foreground">{step}</span>
                  </div>
                  {!s.done ? (
                    <div className="mt-2 flex gap-2 pl-7">
                      {needsPhoto ? (
                        <button onClick={() => takePhoto(i)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white">
                          {s.photo === "checking" ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                          {s.photo === "checking" ? "AI is checking" : "Take photo"}
                        </button>
                      ) : (
                        <button onClick={() => setItem(i, { done: true })} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-white">
                          {isInspection ? "Pass" : "Done"}
                        </button>
                      )}
                      {isInspection ? (
                        <button onClick={() => setItem(i, { done: true, failed: true })} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-badge-error-foreground">
                          Fail
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {s.photo === "ok" ? (
                    <div className="mt-2 flex items-center gap-2 pl-7">
                      <span className="flex h-10 w-14 items-center justify-center rounded-md bg-gradient-to-br from-slate-300 to-slate-500 text-[9px] text-white">photo</span>
                      <span className="text-xs text-badge-success-foreground">AI: matches the SOP step. Looks right.</span>
                    </div>
                  ) : null}
                  {s.failed ? (
                    <div className="mt-2 rounded-lg bg-badge-error px-2 py-1.5 pl-7 text-xs text-rose-800">
                      Work order WO-1060 opened for {person(a.ownerId).name.split(" ")[0]}&apos;s team with this item and the photo
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {screen === "done" && job ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-badge-success-foreground">
              <ShieldCheck className="size-8" />
            </span>
            <p className="text-lg font-semibold text-foreground">Done. The record is closed.</p>
            <p className="text-sm text-muted-foreground">
              {fromWo?.woRef ?? job.woRef} completed with {Object.values(items).filter((s) => s.photo === "ok").length} photos checked by AI.
              {failed.length > 0 ? ` ${failed.length} failed item opened a repair work order.` : ""} No one has to close it in the office.
            </p>
            <button onClick={() => reset("home")} className="mt-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground">
              Back to {a.name}
            </button>
          </div>
        ) : null}
      </div>

      {screen === "precheck" && job ? (
        <div className="border-t border-border bg-card p-3">
          <button
            disabled={!ack || !permitApproved}
            onClick={() => setScreen("run")}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:bg-border"
          >
            Start
          </button>
        </div>
      ) : null}
      {screen === "run" ? (
        <div className="border-t border-border bg-card p-3">
          <button disabled={!allDone} onClick={finish} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:bg-border">
            Finish and close
          </button>
        </div>
      ) : null}
    </div>
  );
}

type MobileMsg = {
  id: string;
  role: "user" | "nova";
  text: string;
  card?: { label: string; value: string }[];
  action?: { label: string; result: string };
  done?: boolean;
};

/** Scripted answers, always about the asset whose QR was scanned. */
function answerFor(text: string, a: Asset): Omit<MobileMsg, "id" | "role"> {
  const t = text.toLowerCase();
  const last = a.lastWorkOrders[0];
  const owner = person(a.ownerId).name;
  if (t.includes("hose") || t.includes("leak") || t.includes("replace")) {
    return {
      text: `No procedure on file covers that on ${a.name}. I can open a work order with ${a.docs.find((d) => d.type === "jha")?.ref ?? "the JHA"} attached and assign it to you. Lower the forks and remove the key before you start.`,
      action: { label: "Create work order", result: `WO-1061 created and assigned to you · ${owner} gets a copy` },
    };
  }
  if (t.includes("horn") || t.includes("broken") || t.includes("weak") || t.includes("not working")) {
    return {
      text: `${last ? `${last.ref} fixed this on ${last.date}, so it is a repeat.` : ""} I will open a repair work order linked to it, so ${owner} sees the pattern.`,
      action: { label: "Create repair work order", result: `WO-1062 created, linked to ${last?.ref ?? "the last repair"}` },
    };
  }
  if (t.includes("last") || t.includes("history") || t.includes("serviced") || t.includes("when")) {
    return {
      text: `Here is what happened on ${a.name} lately.`,
      card: [
        ...a.lastWorkOrders.slice(0, 3).map((w) => ({ label: w.date, value: `${w.ref} · ${w.title}` })),
        ...(a.aiHint ? [{ label: "Next", value: a.aiHint }] : []),
      ],
    };
  }
  if (t.includes("sop") || t.includes("procedure") || t.includes("battery") || t.includes("how")) {
    const sop = a.docs.find((d) => d.type === "sop" && /batter/i.test(d.title)) ?? a.docs.find((d) => d.type === "sop");
    return sop
      ? {
          text: `${sop.ref} covers it.${sop.match ? " It is not linked to this asset yet; I found it by its title." : ""}`,
          card: [
            { label: "Procedure", value: `${sop.ref} · ${sop.title}` },
            { label: "Status", value: sop.status === "approved" ? "Approved" : "In review" },
          ],
        }
      : { text: `${a.name} has no SOP yet. I can ask ${owner} to write one.` };
  }
  return { text: `I can open a work order, find a procedure, or tell you what happened on ${a.name}. What do you need?` };
}

/** "Something else" at the asset: Nova on the phone, already knowing which asset was scanned. */
function MobileNova({ asset: a, onBack }: { asset: Asset; onBack: () => void }) {
  const [msgs, setMsgs] = useState<MobileMsg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chips = ["The horn is weak again", "Replace a leaking hose", "When was it last serviced?", "How do I charge the battery?"];

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setMsgs((m) => [...m, { id: `u${m.length}`, role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: `n${m.length}`, role: "nova", ...answerFor(text, a) }]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-subtle">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5">
        <button onClick={onBack} className="rounded p-1 text-muted-foreground" aria-label="Back">
          <ChevronLeft className="size-5" />
        </button>
        <NovaBall />
        <span className="text-sm font-semibold text-foreground">Nova</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
          <QrCode className="size-3" /> {a.code} · {a.name}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Hi Carlos. How can I help?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            I know you are at {a.name}, {locationName(a.locationId)}.
          </p>
        </div>
        {msgs.length === 0 ? (
          <div className="flex flex-col items-start gap-2">
            {chips.map((c, i) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm font-medium text-foreground"
              >
                <Sparkles className="size-3.5 shrink-0" style={{ color: ["#10B981", "#3B82F6", "#F59E0B", "#14B8A6"][i] }} />
                {c}
              </button>
            ))}
          </div>
        ) : null}
        {msgs.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-auto w-fit max-w-[85%] rounded-3xl bg-[#c6d4fb]/50 px-4 py-2 text-sm text-foreground shadow-sm">
              {m.text}
            </div>
          ) : (
            <div key={m.id} className="space-y-2">
              <p className="text-sm leading-6 text-foreground">{m.text}</p>
              {m.card ? (
                <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-border bg-card">
                  {m.card.map((r) => (
                    <div key={r.label + r.value} className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.label}</span>
                      <span className="text-right text-xs text-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {m.action ? (
                m.done ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-badge-success px-3 py-2 text-xs font-medium text-emerald-800">
                    <Check className="size-3.5" /> {m.action.result}
                  </div>
                ) : (
                  <button
                    onClick={() => setMsgs((list) => list.map((x) => (x.id === m.id ? { ...x, done: true } : x)))}
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white"
                  >
                    {m.action.label}
                  </button>
                )
              ) : null}
            </div>
          ),
        )}
        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Reading {a.name}&apos;s records…
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-border bg-card p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-4 pr-1 shadow-sm">
          <input
            id="mobile-nova-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-placeholder"
          />
          <button type="button" className="flex size-8 items-center justify-center rounded-full text-muted-foreground" aria-label="Dictate">
            <Mic className="size-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="flex size-8 items-center justify-center rounded-full bg-primary text-white disabled:bg-primary/40"
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function MobilePage() {
  const params = useSearchParams();
  const current = params.get("asset") ?? "fl03";
  const scenarios = useMemo(() => ASSETS.filter((x) => ["fl03", "hp04", "cv12"].includes(x.id)), []);
  return (
    <PageShell title="Safety Execution" mainClassName="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
        <TapCompare today="no field flow" todayDetail="the technician gets a PDF or nothing" here="scan, pick, do" />
      </div>
      <div className="flex flex-1 items-start justify-center gap-10 pt-2">
        <Suspense>
          <MobileInner key={current} />
        </Suspense>
        <aside className="hidden w-72 shrink-0 space-y-3 pt-6 lg:block">
          <h2 className="text-lg font-semibold text-foreground">At the asset</h2>
          <p className="text-sm text-muted-foreground">
            The technician taps Scan in Safety, on the phone&apos;s browser, and points the camera at the asset&apos;s QR. Safety opens the asset
            with its documents. Work offers only the jobs those documents allow and shows what is missing before starting: permit, hazards, PPE.
          </p>
          <p className="text-xs text-muted-foreground">
            The QR is the one the CMMS already prints (Generate QR Code on the asset). It holds the asset&apos;s barcode, so Safety finds the asset by
            it. Today only the UpKeep mobile app reads it. Fallback: a Safety Access Point linked to the asset; the field exists, but in the 5 most
            active clients 0 of 147 Access Points link an asset.
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>· &quot;Something else&quot; opens Nova with this asset as context: history, procedures, a new work order</li>
            <li>· The whole checklist on one screen, not a step-by-step wizard</li>
            <li>· Photos checked by AI against the SOP step</li>
            <li>· A failed item opens a work order by itself</li>
            <li>· Finishing closes the record, no office step</li>
          </ul>
          <div className="pt-2">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-placeholder">Scan another asset</div>
            <div className="flex flex-wrap gap-1.5">
              {scenarios.map((s) => (
                <a
                  key={s.id}
                  href={`/safety-execution/mobile?asset=${s.id}`}
                  className={cn("rounded-full border px-2.5 py-1 text-xs", s.id === current ? "border-primary/40 bg-badge-accent text-indigo-800" : "border-border text-foreground")}
                >
                  {s.code} {s.name}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <MobilePage />
    </Suspense>
  );
}
