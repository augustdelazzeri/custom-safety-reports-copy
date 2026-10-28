"use client";

import { RdAsk, RdTable, type RdColumn } from "@/components/redesign/table";
import { Muted, RdBadge, RdEmptyState, RdPage, figmaButton } from "@/components/redesign/ui";
import { RowMenu } from "@/components/screens/settings/shared";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { deleteInspectionTemplate } from "@/lib/inspectionStore";
import { trpc } from "@/providers/trpc";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Template = any;

export default function SafetyTemplatesList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: templates, isLoading } = trpc.eventFormTemplate.list.useQuery();

  const words = search.trim().toLowerCase();
  const rows: Template[] = (templates ?? []).filter((t: Template) => !words || `${t.name} ${t.createdBy}`.toLowerCase().includes(words));

  const columns: RdColumn<Template>[] = [
    {
      key: "name",
      header: "Name",
      render: (t) => (
        <span className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">{t.name}</span>
          {t.type === "inspection" ? <RdBadge tone="accent">Inspection</RdBadge> : null}
        </span>
      ),
    },
    { key: "fields", header: "Fields", width: "13%", render: (t) => (t.type === "inspection" ? `${t.tasks?.length || t.fieldsCount} tasks` : t.fieldsCount) },
    { key: "conditions", header: "Conditions", width: "13%", render: (t) => (t.type === "inspection" ? <Muted /> : t.conditionsCount) },
    { key: "by", header: "Created by", width: "16%", render: (t) => <span className="block truncate">{t.createdBy}</span> },
    { key: "date", header: "Created", width: "20%", render: (t) => <span className="text-muted-foreground">{t.createdAt}</span> },
    {
      key: "menu",
      header: "",
      width: "64px",
      render: (t) => (
        <span onClick={(e) => e.stopPropagation()}>
          <RowMenu
            label={`Actions for ${t.name}`}
            items={[
              { key: "open", label: "Open", onSelect: () => router.push(`/settings/safety-templates/${t.id}`) },
              { key: "dup", label: "Duplicate", onSelect: () => toast.success("Template duplicated") },
              {
                key: "delete",
                label: "Delete",
                onSelect: () => {
                  if (t.type === "inspection") {
                    deleteInspectionTemplate(t.id);
                    toast.success("Inspection template deleted");
                    window.location.reload();
                  } else {
                    toast.success("Template archived");
                  }
                },
              },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <PageShell title="Settings" mainClassName="p-0">
      <RdPage
        title="Form templates"
        subtitle="Custom forms for events and inspections: which fields a report asks for, and when."
        onBack={() => router.push("/settings?tab=templates")}
        actions={
          <Button type="button" className={figmaButton} onClick={() => router.push("/settings/safety-templates/new")}>
            <Plus aria-hidden />
            Create template
          </Button>
        }
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        ) : (templates ?? []).length ? (
          <div className="flex flex-col gap-6">
            <RdAsk value={search} onChange={setSearch} />
            {rows.length ? <RdTable rows={rows} columns={columns} rowKey={(t) => t.id} onRow={(t) => router.push(`/settings/safety-templates/${t.id}`)} /> : <RdEmptyState title="Nothing matches" body="Try other words." />}
          </div>
        ) : (
          <RdEmptyState title="No templates yet" body="Events use the standard form until you create a custom one." />
        )}
      </RdPage>
    </PageShell>
  );
}
