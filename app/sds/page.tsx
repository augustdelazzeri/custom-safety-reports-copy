"use client";

import { TitleCell } from "@/components/redesign/ui";
import type { RdColumn } from "@/components/redesign/table";
import { Button } from "@/components/ui/button";
import { DocList, DocPage, StatusBadge } from "@/components/screens/docs/kit";
import { SDS_ROWS } from "@/lib/screens/docs";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { FileUp } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const columns: RdColumn<Row>[] = [
  { key: "title", header: "Product", render: (r) => <TitleCell title={r.product} reference={r.slug} /> },
  { key: "maker", header: "Manufacturer", width: "24%", render: (r) => <span className="block truncate">{r.manufacturer}</span> },
  { key: "where", header: "Location", width: "22%", render: (r) => <span className="block truncate">{r.where}</span> },
  { key: "status", header: "Status", width: "14%", render: (r) => <StatusBadge status={r.status} /> },
];

export default function SdsLog() {
  const [mode] = useDataMode();
  const rows: Row[] = mode === "sample" ? SDS_ROWS.map((r) => ({ id: r.ref, product: r.product, slug: r.ref, manufacturer: r.maker, status: r.status, where: r.where })) : [];
  return (
    <DocPage
      breadcrumb="Documentation"
      title="SDS library"
      subtitle="The safety data sheets for every chemical on site."
      actions={
        <Button className="gap-2" title="Opens the upload (not part of this prototype)">
          <FileUp className="size-4" /> Upload SDS
        </Button>
      }
    >
      <DocList rows={rows} loading={false} error={null} columns={columns} basePath="/sds" noun="safety data sheets" words={(r: Row) => `${r.product} ${r.slug} ${r.manufacturer}`} statusOf={(r: Row) => r.status} />
    </DocPage>
  );
}
