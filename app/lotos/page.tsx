"use client";

import { Muted, TitleCell } from "@/components/redesign/ui";
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
  { key: "status", header: "Status", width: "13%", render: (r) => <StatusBadge status={r.status} /> },
  { key: "asset", header: "Asset", width: "16%", render: (r) => (r.assetName ? <span className="block truncate">{r.assetName}</span> : <Muted />) },
  { key: "owner", header: "Owner", width: "15%", render: (r) => <span className="block truncate">{r.ownerName}</span> },
  { key: "location", header: "Location", width: "15%", render: (r) => <span className="block truncate">{r.locationName}</span> },
];

export default function LotoLog() {
  const router = useRouter();
  const [mode] = useDataMode();
  const rows: Row[] = mode === "sample" ? docRecs("loto") : [];
  return (
    <DocPage
      breadcrumb="Documentation"
      title="Lockout/tagout"
      subtitle="Isolation procedures for servicing equipment safely."
      actions={
        <Button className="gap-2" onClick={() => router.push("/lotos/new")}>
          <Plus className="size-4" /> New lockout/tagout
        </Button>
      }
    >
      <DocList rows={rows} loading={false} error={null} columns={columns} basePath="/lotos" noun="lockout/tagout procedures" words={(r: Row) => `${r.title} ${r.slug} ${r.ownerName} ${r.locationName} ${r.assetName}`} statusOf={(r: Row) => r.status} />
    </DocPage>
  );
}
