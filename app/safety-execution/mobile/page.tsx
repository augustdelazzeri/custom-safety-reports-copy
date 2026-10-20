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
    <div className="mx-auto flex w-[380px] shrink-0 flex-col overflow-hidden rounded-[40px] border-[10px] border-gray-900 bg-white shadow-2xl" style={{ height: "min(760px, calc(100vh - 150px))" }}>
      <div className="flex items-center justify-between bg-gray-900 px-6 pb-1 pt-1 text-[11px] text-white">
        <span>9:41</span>
        <span className="h-5 w-24 rounded-full bg-black" />
        <span>5G</span>
      </div>

      {/* Asset header, visible once the QR is scanned */}
      {screen !== "scan" && screen !== "nova" ? (
        <>
          <div className="truncate bg-gray-100 px-4 py-1 text-center font-mono text-[10px] text-gray-500">app.upkeep.com/ehs/assets/{a.code.toLowerCase()}</div>
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            {screen !== "home" ? (
              <button onClick={() => reset(screen === "run" ? "precheck" : "home")} className="-ml-1 rounded p-1 text-gray-500" aria-label="Back">
                <ChevronLeft className="size-5" />
              </button>
            ) : (
              <QrCode className="size-5 text-gray-400" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-900">
                {a.code} · {a.name}
              </div>
              <div className="text-[11px] text-gray-500">{locationName(a.locationId)} · Asset QR, scanned just now</div>
            </div>
            <span className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700">CR</span>
          </div>
        </>
      ) : null}

      {screen === "nova" ? <MobileNova asset={a} onBack={() => setScreen("home")} /> : null}
      <div className={cn("flex-1 overflow-y-auto bg-gray-50/60", screen === "nova" && "hidden")}>
        {screen === "scan" ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 bg-gray-900 p-6 text-center">
            <p className="text-sm text-gray-300">Point the camera at the asset&apos;s QR</p>
            <div className="relative rounded-2xl border-2 border-white/80 p-3">
              <div className="w-48 rounded-xl bg-white p-3 text-left shadow-lg">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  <Wrench className="size-3" /> UpKeep asset
                </div>
                <QrCode className="mx-auto my-2 size-24 text-gray-900" />
                <div className="text-xs font-semibold text-gray-900">{a.name}</div>
                <div className="font-mono text-[10px] text-gray-500">{a.code}</div>
              </div>
            </div>
            <button onClick={() => setScreen("home")} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900">
              Scan
            </button>
            <p className="text-[11px] leading-relaxed text-gray-400">
              Safety opens the camera in the phone&apos;s browser, no app to install. It reads the QR the CMMS already prints for the asset and finds
              the asset by its barcode.
            </p>
          </div>
        ) : null}

        {screen === "home" ? (
          <div className="flex rounded-none border-b border-gray-200 bg-white px-2 text-sm">
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
                  tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500",
                )}
              >
                {label}
                {isNew ? <span className="rounded bg-indigo-100 px-1 text-[9px] font-bold uppercase text-indigo-700">New</span> : null}
              </button>
            ))}
          </div>
        ) : null}

        {screen === "home" && tab === "report" ? (
          <div className="space-y-3 p-4">
            <p className="text-lg font-semibold text-gray-900">What happened?</p>
            <p className="text-xs text-gray-500">Today&apos;s event flow, with this asset already filled in.</p>
            <div className="flex min-h-24 items-start rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-400">Speak or type, the AI fills the form</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-800">
                <Mic className="size-4 text-indigo-600" /> Speak
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-800">
                <Camera className="size-4 text-gray-600" /> Photo
              </button>
            </div>
          </div>
        ) : null}

        {screen === "home" && tab === "docs" ? (
          <div className="space-y-2 p-4">
            <p className="text-xs text-gray-500">Every Safety document of this asset: linked, or found by the AI by its title.</p>
            {a.docs.map((d) => (
              <div key={d.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                <div className="font-mono text-[10px] text-gray-500">{d.ref}</div>
                <div className="text-sm text-gray-900">{d.title}</div>
              </div>
            ))}
          </div>
        ) : null}

        {screen === "home" && tab === "work" ? (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] text-indigo-800">
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
                  className="w-full rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-left"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Assigned to you</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {e.woRef} · {getJob(e.jobId)?.title}
                  </div>
                </button>
              ))}
            <div>
              <p className="text-lg font-semibold text-gray-900">What are you doing on {a.name}?</p>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <Sparkles className="size-3 text-indigo-600" /> From the {a.docs.length} documents of this asset
              </p>
            </div>
            {jobs.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setJobId(j.id);
                  setScreen("precheck");
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm active:scale-[0.99]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  {j.verb === "Inspect" ? <ClipboardCheck className="size-5" /> : <Wrench className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-gray-900">{j.title.replace(new RegExp(`\\s+(on |of )?(the )?${a.name}$`), "")}</span>
                  <span className="block truncate text-xs text-gray-500">{j.reason}</span>
                </span>
                {j.id === "fl03-inspect" ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Due today</span> : null}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTab("report")}
                className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-left text-sm font-medium text-gray-800"
              >
                <Megaphone className="size-4 text-rose-600" /> Report a problem
              </button>
              <button
                onClick={() => setScreen("nova")}
                className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-left text-sm font-medium text-gray-800"
              >
                <NovaBall /> Something else
              </button>
            </div>
          </div>
        ) : null}

        {screen === "precheck" && job ? (
          <div className="space-y-3 p-4">
            <p className="text-lg font-semibold text-gray-900">{job.title}</p>
            <div className={cn("rounded-2xl border p-3", permitApproved ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileCheck className={cn("size-4", permitApproved ? "text-emerald-700" : "text-amber-700")} />
                {needsPermit ? (permitApproved ? "Permit approved" : "Permit not approved yet") : "No permit needed"}
              </div>
              <p className="mt-0.5 text-xs text-gray-600">
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
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <AlertTriangle className="size-4 text-amber-600" /> Hazards from the JHA
              </div>
              <ul className="mt-1.5 space-y-1 text-sm text-gray-700">
                {(HAZARDS[assetId] ?? HAZARDS.fl03).map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(PPE[assetId] ?? PPE.fl03).map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                    <HardHat className="size-3" /> {p}
                  </span>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-800">
              <input id="ack-jha" type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="size-4 accent-indigo-600" />
              I read the hazards and I&apos;m wearing the PPE
            </label>
          </div>
        ) : null}

        {screen === "run" && job ? (
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{job.title}</p>
              <span className="text-xs text-gray-500">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(doneCount / Math.max(checklist.length, 1)) * 100}%` }} />
            </div>
            {checklist.map((step, i) => {
              const s = items[i] ?? { done: false };
              const needsPhoto = /photo|hoses|forks/i.test(step);
              return (
                <div key={step} className={cn("rounded-2xl border bg-white p-3", s.failed ? "border-rose-300" : s.done ? "border-emerald-200" : "border-gray-200")}>
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", s.done ? (s.failed ? "bg-rose-600 text-white" : "bg-emerald-600 text-white") : "bg-gray-100 text-gray-500")}>
                      {s.done ? s.failed ? <X className="size-3" /> : <Check className="size-3" /> : i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-800">{step}</span>
                  </div>
                  {!s.done ? (
                    <div className="mt-2 flex gap-2 pl-7">
                      {needsPhoto ? (
                        <button onClick={() => takePhoto(i)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white">
                          {s.photo === "checking" ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                          {s.photo === "checking" ? "AI is checking" : "Take photo"}
                        </button>
                      ) : (
                        <button onClick={() => setItem(i, { done: true })} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">
                          {isInspection ? "Pass" : "Done"}
                        </button>
                      )}
                      {isInspection ? (
                        <button onClick={() => setItem(i, { done: true, failed: true })} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700">
                          Fail
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {s.photo === "ok" ? (
                    <div className="mt-2 flex items-center gap-2 pl-7">
                      <span className="flex h-10 w-14 items-center justify-center rounded-md bg-gradient-to-br from-slate-300 to-slate-500 text-[9px] text-white">photo</span>
                      <span className="text-[11px] text-emerald-700">AI: matches the SOP step. Looks right.</span>
                    </div>
                  ) : null}
                  {s.failed ? (
                    <div className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 pl-7 text-[11px] text-rose-800">
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
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-8" />
            </span>
            <p className="text-lg font-semibold text-gray-900">Done. The record is closed.</p>
            <p className="text-sm text-gray-600">
              {fromWo?.woRef ?? job.woRef} completed with {Object.values(items).filter((s) => s.photo === "ok").length} photos checked by AI.
              {failed.length > 0 ? ` ${failed.length} failed item opened a repair work order.` : ""} No one has to close it in the office.
            </p>
            <button onClick={() => reset("home")} className="mt-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800">
              Back to {a.name}
            </button>
          </div>
        ) : null}
      </div>

      {screen === "precheck" && job ? (
        <div className="border-t border-gray-100 bg-white p-3">
          <button
            disabled={!ack || !permitApproved}
            onClick={() => setScreen("run")}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            Start
          </button>
        </div>
      ) : null}
      {screen === "run" ? (
        <div className="border-t border-gray-100 bg-white p-3">
          <button disabled={!allDone} onClick={finish} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:bg-gray-300">
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
    <div className="flex min-h-0 flex-1 flex-col bg-[#fafafa]">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2.5">
        <button onClick={onBack} className="rounded p-1 text-gray-500" aria-label="Back">
          <ChevronLeft className="size-5" />
        </button>
        <NovaBall />
        <span className="text-sm font-semibold text-gray-900">Nova</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
          <QrCode className="size-3" /> {a.code} · {a.name}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Hi Carlos. How can I help?</p>
          <p className="mt-1 text-xs text-gray-500">
            I know you are at {a.name}, {locationName(a.locationId)}.
          </p>
        </div>
        {msgs.length === 0 ? (
          <div className="flex flex-col items-start gap-2">
            {chips.map((c, i) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-left text-sm font-medium text-gray-700"
              >
                <Sparkles className="size-3.5 shrink-0" style={{ color: ["#10B981", "#3B82F6", "#F59E0B", "#14B8A6"][i] }} />
                {c}
              </button>
            ))}
          </div>
        ) : null}
        {msgs.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-auto w-fit max-w-[85%] rounded-3xl bg-[#c6d4fb]/50 px-4 py-2 text-sm text-gray-900 shadow-sm">
              {m.text}
            </div>
          ) : (
            <div key={m.id} className="space-y-2">
              <p className="text-sm leading-6 text-gray-900">{m.text}</p>
              {m.card ? (
                <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {m.card.map((r) => (
                    <div key={r.label + r.value} className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{r.label}</span>
                      <span className="text-right text-xs text-gray-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {m.action ? (
                m.done ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                    <Check className="size-3.5" /> {m.action.result}
                  </div>
                ) : (
                  <button
                    onClick={() => setMsgs((list) => list.map((x) => (x.id === m.id ? { ...x, done: true } : x)))}
                    className="rounded-full bg-[#3e63dd] px-4 py-1.5 text-sm font-medium text-white"
                  >
                    {m.action.label}
                  </button>
                )
              ) : null}
            </div>
          ),
        )}
        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" /> Reading {a.name}&apos;s records…
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-gray-100 bg-white p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 shadow-sm">
          <input
            id="mobile-nova-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <button type="button" className="flex size-8 items-center justify-center rounded-full text-gray-600" aria-label="Dictate">
            <Mic className="size-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="flex size-8 items-center justify-center rounded-full bg-[#3e63dd] text-white disabled:bg-[#3e63dd]/40"
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
          <h2 className="text-lg font-semibold text-gray-900">At the asset</h2>
          <p className="text-sm text-gray-600">
            The technician taps Scan in Safety, on the phone&apos;s browser, and points the camera at the asset&apos;s QR. Safety opens the asset
            with its documents. Work offers only the jobs those documents allow and shows what is missing before starting: permit, hazards, PPE.
          </p>
          <p className="text-xs text-gray-500">
            The QR is the one the CMMS already prints (Generate QR Code on the asset). It holds the asset&apos;s barcode, so Safety finds the asset by
            it. Today only the UpKeep mobile app reads it. Fallback: a Safety Access Point linked to the asset; the field exists, but in the 5 most
            active clients 0 of 147 Access Points link an asset.
          </p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li>· &quot;Something else&quot; opens Nova with this asset as context: history, procedures, a new work order</li>
            <li>· The whole checklist on one screen, not a step-by-step wizard</li>
            <li>· Photos checked by AI against the SOP step</li>
            <li>· A failed item opens a work order by itself</li>
            <li>· Finishing closes the record, no office step</li>
          </ul>
          <div className="pt-2">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Scan another asset</div>
            <div className="flex flex-wrap gap-1.5">
              {scenarios.map((s) => (
                <a
                  key={s.id}
                  href={`/safety-execution/mobile?asset=${s.id}`}
                  className={cn("rounded-full border px-2.5 py-1 text-xs", s.id === current ? "border-indigo-300 bg-indigo-50 text-indigo-800" : "border-gray-200 text-gray-700")}
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
