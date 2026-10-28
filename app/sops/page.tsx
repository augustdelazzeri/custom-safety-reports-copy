"use client";

import { TitleCell } from "@/components/redesign/ui";
import type { RdColumn } from "@/components/redesign/table";
import { Button } from "@/components/ui/button";
import { DocList, DocPage, StatusBadge } from "@/components/screens/docs/kit";
import { docRecs } from "@/lib/screens/docs";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const columns: RdColumn<Row>[] = [
  { key: "title", header: "Title", render: (r) => <TitleCell title={r.title} reference={r.slug} /> },
  { key: "status", header: "Status", width: "14%", render: (r) => <StatusBadge status={r.status} /> },
  { key: "owner", header: "Owner", width: "16%", render: (r) => <span className="block truncate">{r.ownerName}</span> },
  { key: "location", header: "Location", width: "16%", render: (r) => <span className="block truncate">{r.locationName}</span> },
];

export default function SopLog() {
  const router = useRouter();
  const [mode] = useDataMode();
  const rows: Row[] = mode === "sample" ? docRecs("sop") : [];
  return (
    <DocPage
      breadcrumb="Documentation"
      title="Procedures"
      subtitle="Standard operating procedures: the steps, the risks and who approves them."
      actions={
        <Button className="gap-2" onClick={() => router.push("/sops/new")}>
          <Plus className="size-4" /> New procedure
        </Button>
      }
    >
      <DocList rows={rows} loading={false} error={null} columns={columns} basePath="/sops" noun="procedures" words={(r: Row) => `${r.title} ${r.slug} ${r.ownerName} ${r.locationName}`} statusOf={(r: Row) => r.status} />
    </DocPage>
  );
}
