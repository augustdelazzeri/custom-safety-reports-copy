"use client";

import { DocumentExecutionBlock } from "@/components/execution/DocumentExecutionBlock";
import { Block, DocPage, DocState, PeopleAside, RecordActions, RecordGrid, RecordMeta, fmt } from "@/components/screens/docs/kit";
import { EmergenciesPanel, Overview, ProcedurePhases, ReferencePanel, RisksPanel } from "@/components/sop/mocks";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams } from "next/navigation";

export default function SopDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.sop.getByInstanceId.useQuery({ id });
  const sop = withRec("sop", id, raw);

  if (error) return <DocState breadcrumb="Procedure" kind="error" what="this procedure" back="/sops" />;
  if (isLoading || !sop) return <DocState breadcrumb="Procedure" kind="loading" what="the procedure" back="/sops" />;

  return (
    <DocPage breadcrumb="Procedure" title={sop.title} eyebrow={sop.slug} record back="/sops" actions={<RecordActions editPath={`/sops/${id}/edit`} />} subtitle={<RecordMeta status={sop.status} version={sop.version} items={[["Owner", sop.owner?.fullName], ["Last reviewed", fmt(sop.updatedAt)], ["Next review", fmt(sop.reviewDate)]]} />}>
      <RecordGrid
        main={
          <>
            <DocumentExecutionBlock docType="sop" docId={sop.id} docTitle={sop.title} />
            <Overview purpose={sop.purpose} responsibilities={sop.responsibilities} />
            <ProcedurePhases sectionGroups={sop.sectionGroups} />
            <RisksPanel sectionGroups={sop.sectionGroups} />
            <EmergenciesPanel sectionGroups={sop.sectionGroups} />
            <ReferencePanel sectionGroups={sop.sectionGroups} />
          </>
        }
        aside={
          <>
            <PeopleAside owner={sop.owner} approvers={sop.approvers} location={sop.location} created={sop.createdAt} updated={sop.updatedAt} />
            <Block title="Linked documents">
              <p className="text-sm text-muted-foreground">No linked documents.</p>
            </Block>
          </>
        }
      />
    </DocPage>
  );
}
