"use client";

/**
 * Settings → Company (the redesign's settings-company.tsx): what UpKeep syncs and what Safety
 * adds (country, address, industry, NAICS, language), the regulations the company works under,
 * and the instructions every AI answer follows. Report types are a placeholder here.
 */

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { Muted, RdBadge, RdCard, RdEmptyState, RdSegmented, useTabParam } from "@/components/redesign/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_MAX,
  AI_NOTE,
  CATALOG,
  COUNTRIES,
  FRAMEWORK_CATEGORY,
  INDUSTRIES,
  LANGUAGES,
  REPORT_TYPES_NOTE,
  SYNCED,
  type CompanyProfile,
  type Framework,
} from "@/lib/screens/settings";
import { Check, ExternalLink, Plus } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { PlaceholderCard, RowMenu, SettingsField, SettingsFormDialog, SettingsPane, SettingsSection, selectClass, settingsButton } from "./shared";

const SEGMENTS = [
  { value: "organization", label: "Organization" },
  { value: "frameworks", label: "Regulatory frameworks" },
  { value: "reportTypes", label: "Report types" },
  { value: "ai", label: "AI instructions" },
] as const;
type Segment = (typeof SEGMENTS)[number]["value"];

const countryName = (() => {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    names = null;
  }
  return (code: string) => names?.of(code) ?? code;
})();

/** Discard and Save, right-aligned, with a quiet confirmation after a save. */
function SaveBar({ dirty, saved, onDiscard }: { dirty: boolean; saved: boolean; onDiscard: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {saved && !dirty ? (
        <span className="mr-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Check className="size-4" aria-hidden /> Saved
        </span>
      ) : null}
      <Button type="button" variant="outline" size="sm" className={settingsButton} disabled={!dirty} onClick={onDiscard}>
        Discard
      </Button>
      <Button type="submit" size="sm" className={settingsButton} disabled={!dirty}>
        Save changes
      </Button>
    </div>
  );
}

// ───────────────────────────── organization

function Organization({ initial }: { initial: CompanyProfile }) {
  const ids = { country: useId(), state: useId(), city: useId(), naics: useId(), industry: useId(), language: useId(), address: useId() };
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmCountry, setConfirmCountry] = useState(false);
  const dirty = (Object.keys(form) as (keyof CompanyProfile)[]).some((k) => form[k] !== saved[k]);
  const leavingUs = (saved.country === "" || saved.country === "US") && form.country !== "" && form.country !== "US";
  const set = (field: keyof CompanyProfile) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setJustSaved(false);
  };
  const save = () => {
    setSaved(form);
    setJustSaved(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <RdCard
        title="Synced from UpKeep"
        action={
          <button type="button" title="Opens UpKeep’s settings (not part of this prototype)" className="inline-flex items-center gap-1 text-sm font-medium text-badge-accent-foreground hover:underline">
            Change in UpKeep
            <ExternalLink className="size-4" aria-hidden />
          </button>
        }
      >
        <div className="flex flex-col gap-4 p-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SYNCED.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{f.value ?? <Muted>Not set</Muted>}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted-foreground">These come from UpKeep and can only be changed there.</p>
        </div>
      </RdCard>

      <RdCard title="Location & industry">
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (leavingUs) setConfirmCountry(true);
            else save();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Country" htmlFor={ids.country}>
              <select id={ids.country} data-slot="input" className={selectClass} value={form.country} onChange={(e) => set("country")(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {countryName(c)}
                  </option>
                ))}
              </select>
            </SettingsField>
            <SettingsField label="State or province" htmlFor={ids.state}>
              <Input id={ids.state} value={form.state} onChange={(e) => set("state")(e.target.value)} maxLength={255} />
            </SettingsField>
            <SettingsField label="City" htmlFor={ids.city}>
              <Input id={ids.city} value={form.city} onChange={(e) => set("city")(e.target.value)} maxLength={255} />
            </SettingsField>
            <SettingsField label="NAICS code" htmlFor={ids.naics} hint="The six-digit code for your industry.">
              <Input id={ids.naics} value={form.naicsCode} inputMode="numeric" onChange={(e) => set("naicsCode")(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </SettingsField>
            <SettingsField label="Industry" htmlFor={ids.industry}>
              <select id={ids.industry} data-slot="input" className={selectClass} value={form.industryType} onChange={(e) => set("industryType")(e.target.value)}>
                <option value="" disabled>
                  Choose an industry
                </option>
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </SettingsField>
            <SettingsField label="Primary language" htmlFor={ids.language} hint="The language AI answers are written in.">
              <select id={ids.language} data-slot="input" className={selectClass} value={form.primaryLanguage} onChange={(e) => set("primaryLanguage")(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </SettingsField>
            <div className="sm:col-span-2">
              <SettingsField label="Address" htmlFor={ids.address}>
                <Textarea id={ids.address} value={form.address} onChange={(e) => set("address")(e.target.value)} maxLength={2000} rows={2} />
              </SettingsField>
            </div>
          </div>
          <SaveBar dirty={dirty} saved={justSaved} onDiscard={() => setForm(saved)} />
        </form>
      </RdCard>

      <AlertDialog open={confirmCountry} onOpenChange={setConfirmCountry}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>OSHA will be hidden</AlertDialogTitle>
            <AlertDialogDescription>
              Outside the United States, OSHA logs, the 300A summary and agency reports are hidden. Nothing is deleted, and they come back if the country is set to the United States again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the United States</AlertDialogCancel>
            <AlertDialogAction onClick={save}>Change country</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ───────────────────────────── regulatory frameworks

function FrameworkName({ f, custom }: { f: Framework; custom?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{f.name}</p>
        {f.description ? <p className="truncate text-xs text-text-subtle">{f.description}</p> : null}
      </div>
      {custom ? <RdBadge tone="accent">Custom</RdBadge> : null}
    </div>
  );
}

const categoryCell = (f: Framework) => (f.category ? <RdBadge>{FRAMEWORK_CATEGORY[f.category]}</RdBadge> : <Muted />);
const regionCell = (f: Framework) => (f.region ? <span className="block truncate">{f.region}</span> : <Muted />);

function Frameworks({ active, onAdd, onRemove }: { active: Framework[]; onAdd: (f: Framework) => void; onRemove: (f: Framework) => void }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("name");
  const added = new Set(active.map((f) => f.code).filter(Boolean));
  const regions = useMemo(() => [...new Set(CATALOG.map((f) => f.region ?? ""))].filter(Boolean), []);

  const activeColumns: RdColumn<Framework>[] = [
    { key: "name", header: "Name", render: (f) => <FrameworkName f={f} custom={!f.code} /> },
    { key: "category", header: "Category", width: "20%", render: categoryCell },
    { key: "region", header: "Region", width: "15%", render: regionCell },
    {
      key: "url",
      header: "Reference",
      width: "13%",
      render: (f) =>
        f.url ? (
          <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-badge-accent-foreground hover:underline">
            Open
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : (
          <Muted />
        ),
    },
    { key: "menu", header: "", width: "64px", render: (f) => <RowMenu label={f.name} items={[{ key: "remove", label: "Remove", onSelect: () => onRemove(f) }]} /> },
  ];

  const words = q.trim().toLowerCase();
  const catalog = CATALOG.filter((f) => !picked.length || picked.includes(f.region ?? ""))
    .filter((f) => !words || `${f.name} ${f.description} ${f.code}`.toLowerCase().includes(words))
    .sort((a, b) => (sort === "category" ? (a.category ?? "").localeCompare(b.category ?? "") || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)));

  const catalogColumns: RdColumn<Framework>[] = [
    { key: "name", header: "Name", render: (f) => <FrameworkName f={f} /> },
    { key: "category", header: "Category", width: "20%", render: categoryCell },
    { key: "region", header: "Region", width: "15%", render: regionCell },
    {
      key: "add",
      header: "",
      width: "120px",
      render: (f) => (
        <div className="flex justify-end">
          {f.code && added.has(f.code) ? (
            <Muted>Added</Muted>
          ) : (
            <Button type="button" variant="outline" size="sm" className={settingsButton} onClick={() => onAdd({ ...f, id: `a-${f.id}` })}>
              <Plus aria-hidden />
              Add
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title={`${active.length} active ${active.length === 1 ? "framework" : "frameworks"}`} description="The regulations your company works under. AI answers take them into account.">
        {active.length ? (
          <RdTable rows={active} columns={activeColumns} rowKey={(f) => f.id} />
        ) : (
          <div className="rounded-[var(--lab-radius)] border border-border">
            <RdEmptyState title="No frameworks yet" body="Add the regulations that apply to you from the catalog below." />
          </div>
        )}
      </SettingsSection>
      <SettingsSection title="Catalog" description="Common regulations, ready to add.">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start gap-2">
            <RdAsk value={q} onChange={setQ} placeholder="Search frameworks" />
            <RdToolbar
              filterLabel="Region"
              filters={regions.map((r) => ({ value: r, label: r, count: CATALOG.filter((f) => f.region === r).length }))}
              selected={picked}
              onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
              sorts={[
                { value: "name", label: "Name, A to Z" },
                { value: "category", label: "Category" },
              ]}
              sort={sort}
              onSort={setSort}
            />
          </div>
          {catalog.length ? <RdTable rows={catalog} columns={catalogColumns} rowKey={(f) => f.id} /> : <RdEmptyState title="Nothing in the catalog matches" body="Try other words, or clear the filters." />}
        </div>
      </SettingsSection>
    </div>
  );
}

function CustomFrameworkDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (f: Framework) => void }) {
  const ids = { name: useId(), category: useId(), description: useId(), url: useId() };
  const empty = { name: "", category: "", description: "", url: "" };
  const [form, setForm] = useState(empty);
  const [showErrors, setShowErrors] = useState(false);
  const nameError = !form.name.trim() ? "Give the framework a name." : null;
  const urlError = form.url.trim() !== "" && !/^https?:\/\/\S+$/.test(form.url.trim()) ? "Enter a full link, starting with https://" : null;

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setForm(empty);
      setShowErrors(false);
    }
  };

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={close}
      title="Add custom framework"
      description="A regulation or standard that is not in the catalog."
      submitLabel="Add custom framework"
      onSubmit={() => {
        setShowErrors(true);
        if (nameError || urlError) return;
        onAdd({ id: `local-${Date.now().toString(36)}`, code: null, name: form.name.trim(), description: form.description.trim() || null, category: form.category || null, region: null, url: form.url.trim() || null });
        close(false);
      }}
    >
      <SettingsField label="Name" htmlFor={ids.name} error={showErrors ? nameError : null}>
        <Input id={ids.name} value={form.name} placeholder="e.g. Illinois OSHA (state plan)" onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={(showErrors && Boolean(nameError)) || undefined} />
      </SettingsField>
      <SettingsField label="Category" htmlFor={ids.category}>
        <select id={ids.category} data-slot="input" className={selectClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="">No category</option>
          {Object.entries(FRAMEWORK_CATEGORY).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField label="Description" htmlFor={ids.description}>
        <Textarea id={ids.description} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </SettingsField>
      <SettingsField label="Reference link" htmlFor={ids.url} error={showErrors ? urlError : null}>
        <Input id={ids.url} value={form.url} placeholder="https://" onChange={(e) => setForm({ ...form, url: e.target.value })} aria-invalid={(showErrors && Boolean(urlError)) || undefined} />
      </SettingsField>
    </SettingsFormDialog>
  );
}

// ───────────────────────────── AI instructions

function AiInstructions({ initial }: { initial: string }) {
  const id = useId();
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = value !== saved;
  return (
    <SettingsSection description="Company context every AI answer follows.">
      <RdCard>
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(value);
            setJustSaved(true);
          }}
        >
          <p className="rounded-lg bg-muted p-4 text-sm text-foreground">{AI_NOTE}</p>
          <SettingsField label="Instructions" htmlFor={id} hint={`${value.length} of ${AI_MAX} characters`}>
            <Textarea
              id={id}
              value={value}
              rows={8}
              maxLength={AI_MAX}
              placeholder="e.g. We are a food plant; always consider allergen cross-contact."
              onChange={(e) => {
                setValue(e.target.value);
                setJustSaved(false);
              }}
            />
          </SettingsField>
          <SaveBar dirty={dirty} saved={justSaved} onDiscard={() => setValue(saved)} />
        </form>
      </RdCard>
    </SettingsSection>
  );
}

// ───────────────────────────── the tab

export function CompanyTab({
  title,
  description,
  profile,
  frameworks,
  aiInstructions,
}: {
  title: string;
  description: string;
  profile: CompanyProfile;
  frameworks: Framework[];
  aiInstructions: string;
}) {
  const [segment, setSegment] = useTabParam(
    SEGMENTS.map((s) => s.value),
    "subtab",
  );
  const [active, setActive] = useState(frameworks);
  const [adding, setAdding] = useState(false);
  const add = (f: Framework) => setActive((list) => [...list, f]);

  const action =
    segment === "frameworks" ? (
      <Button type="button" size="sm" className={settingsButton} onClick={() => setAdding(true)}>
        <Plus aria-hidden />
        Add custom framework
      </Button>
    ) : null;

  return (
    <SettingsPane title={title} description={description} action={action}>
      <RdSegmented<Segment> value={segment as Segment} options={[...SEGMENTS]} onChange={setSegment} className="w-fit" />
      {segment === "organization" ? (
        <Organization initial={profile} />
      ) : segment === "frameworks" ? (
        <Frameworks active={active} onAdd={add} onRemove={(f) => setActive((list) => list.filter((x) => x.id !== f.id))} />
      ) : segment === "reportTypes" ? (
        <PlaceholderCard spec={{ card: "Report types", body: REPORT_TYPES_NOTE, control: { kind: "button", label: "Add report type" } }} />
      ) : (
        <AiInstructions initial={aiInstructions} />
      )}
      <CustomFrameworkDialog open={adding} onOpenChange={setAdding} onAdd={add} />
    </SettingsPane>
  );
}
