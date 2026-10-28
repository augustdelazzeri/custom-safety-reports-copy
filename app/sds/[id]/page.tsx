"use client";

import { RdBadge, RdCard } from "@/components/redesign/ui";
import { Block, DocPage, DocState, Fact, RecordGrid, StatusBadge, fmt } from "@/components/screens/docs/kit";
import { GHSPictogramList, SdsSignalWordBadge } from "@/components/sds/mocks";
import { Button } from "@/components/ui/button";
import { withSds } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";

export default function SdsDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.sds.getById.useQuery({ id });
  const sds = withSds(id, raw);

  if (error) return <DocState breadcrumb="SDS library" kind="error" what="this safety data sheet" back="/sds" />;
  if (isLoading || !sds) return <DocState breadcrumb="SDS library" kind="loading" what="the safety data sheet" back="/sds" />;

  return (
    <DocPage
      breadcrumb="SDS library"
      title={sds.product}
      eyebrow={sds.slug}
      record
      back="/sds"
      actions={
        <Button className="gap-2" title="Opens the PDF (not part of this prototype)">
          <FileText className="size-4" /> View PDF
        </Button>
      }
      subtitle={
        <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <StatusBadge status={sds.status} />
          <span>Manufacturer: <span className="text-foreground">{sds.manufacturer}</span></span>
          <span>Revised: <span className="text-foreground">{fmt(sds.revisionDate)}</span></span>
          <SdsSignalWordBadge signalWord={sds.signalWord} />
        </span>
      }
    >
      <RecordGrid
        main={
          <>
            <Block title="GHS classification">
              <dl className="grid gap-4">
                <Fact label="Pictograms">
                  <GHSPictogramList pictograms={sds.pictograms} />
                </Fact>
                <Fact label="Signal word">
                  <SdsSignalWordBadge signalWord={sds.signalWord} />
                </Fact>
              </dl>
            </Block>
            <Block title="First aid measures">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Fact label="Eyes">{sds.firstAid.eyes}</Fact>
                <Fact label="Skin">{sds.firstAid.skin}</Fact>
                <Fact label="Inhalation">{sds.firstAid.inhalation}</Fact>
                <Fact label="Ingestion">{sds.firstAid.ingestion}</Fact>
              </dl>
            </Block>
            <Block title="Personal protective equipment">
              <div className="flex flex-wrap gap-2">
                {sds.ppe.map((item: string) => (
                  <RdBadge key={item} tone="neutral">
                    {item}
                  </RdBadge>
                ))}
              </div>
            </Block>
          </>
        }
        aside={
          <RdCard title="Product info">
            <dl className="flex flex-col gap-4 p-4">
              <Fact label="CAS number">{sds.casNumber}</Fact>
              <Fact label="Appearance">{sds.appearance}</Fact>
              <Fact label="Flash point">{sds.flashPoint}</Fact>
              <Fact label="Next review">{fmt(sds.nextReviewDate)}</Fact>
            </dl>
          </RdCard>
        }
      />
    </DocPage>
  );
}
