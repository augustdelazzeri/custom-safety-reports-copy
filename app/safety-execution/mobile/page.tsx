"use client";

import { CASE_B_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { ASSETS, asset as getAsset, job as getJob, jobsForAsset, locationName, person } from "@/lib/three-cases/data";
import type { ExecutionJob } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
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

type Screen = "home" | "precheck" | "run" | "done";
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
  const [screen, setScreen] = useState<Screen>(fromWo ? "precheck" : "home");
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

      {/* Asset header, always visible */}
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
          <div className="text-[11px] text-gray-500">{locationName(a.locationId)} · scanned just now</div>
        </div>
        <span className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700">CR</span>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/60">
        {screen === "home" ? (
          <div className="space-y-3 p-4">
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
              <button className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-left text-sm font-medium text-gray-800">
                <Megaphone className="size-4 text-rose-600" /> Report a problem
              </button>
              <button className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-left text-sm font-medium text-gray-800">
                <Mic className="size-4 text-indigo-600" /> Something else
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
            The technician scans the QR already on the machine. The AI reads the asset&apos;s documents and offers only the jobs they allow.
            Before starting, it shows what is missing: permit, hazards, PPE.
          </p>
          <ul className="space-y-1.5 text-sm text-gray-600">
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
