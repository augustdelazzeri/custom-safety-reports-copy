"use client";

import { TitleCell } from "@/components/redesign/ui";
import type { RdColumn } from "@/components/redesign/table";
import { Button } from "@/components/ui/button";
import { DocList, DocPage, RiskBadge, StatusBadge } from "@/components/screens/docs/kit";
import { docRecs } from "@/lib/screens/docs";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const columns: RdColumn<Row>[] = [
  { key: "title", header: "Title", render: (r) => <TitleCell title={r.title} reference={r.slug} /> },
  { key: "status", header: "Status", width: "14%", render: (r) => <StatusBadge status={r.status} /> },
  { key: "risk", header: "Residual risk", width: "14%", render: (r) => <RiskBadge score={r.risk} /> },
  { key: "steps", header: "Steps", width: "8%", render: (r) => <span>{r.stepCount}</span> },
  { key: "owner", header: "Owner", width: "15%", render: (r) => <span className="block truncate">{r.ownerName}</span> },
  { key: "location", header: "Location", width: "15%", render: (r) => <span className="block truncate">{r.locationName}</span> },
];

export default function JhaLog() {
  const router = useRouter();
  const [mode] = useDataMode();
  const rows: Row[] = mode === "sample" ? docRecs("jha") : [];
  return (
    <DocPage
      breadcrumb="Documentation"
      title="Job hazard analyses"
      subtitle="Risk assessments for the tasks done on site."
      actions={
        <Button className="gap-2" onClick={() => router.push("/jhas/new")}>
          <Plus className="size-4" /> New job hazard analysis
        </Button>
      }
    >
      <DocList rows={rows} loading={false} error={null} columns={columns} basePath="/jhas" noun="job hazard analyses" words={(r: Row) => `${r.title} ${r.slug} ${r.ownerName} ${r.locationName}`} statusOf={(r: Row) => r.status} />
    </DocPage>
  );
}
