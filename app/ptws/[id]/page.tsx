"use client";

import { DocumentExecutionBlock } from "@/components/execution/DocumentExecutionBlock";
import { DocPage, DocState, PeopleAside, RecordActions, RecordGrid, RecordMeta, fmt } from "@/components/screens/docs/kit";
import { GeneralInformationPanel, HazardsAndControlsPanel } from "@/components/ptw/mocks";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams } from "next/navigation";

export default function PtwDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.ptw.getByInstanceId.useQuery({ id });
  const ptw = withRec("ptw", id, raw);

  if (error) return <DocState breadcrumb="Permit" kind="error" what="this permit" back="/ptws" />;
  if (isLoading || !ptw) return <DocState breadcrumb="Permit" kind="loading" what="the permit" back="/ptws" />;

  return (
    <DocPage breadcrumb="Permit" title={ptw.title} eyebrow={ptw.slug} record back="/ptws" actions={<RecordActions editPath={`/ptws/${id}/edit`} />} subtitle={<RecordMeta status={ptw.status} version={ptw.version} items={[["Owner", ptw.owner?.fullName], ["Last updated", fmt(ptw.updatedAt)], ["Next review", fmt(ptw.reviewDate)]]} />}>
      <RecordGrid
        main={
          <>
            <DocumentExecutionBlock docType="ptw" docId={ptw.id} docTitle={ptw.title} />
            <GeneralInformationPanel type={ptw.type} startDate={ptw.startDate} endDate={ptw.endDate} scope={ptw.scope} emergencyContact={ptw.emergencyContact} />
            <HazardsAndControlsPanel />
          </>
        }
        aside={<PeopleAside owner={ptw.owner} issuer={ptw.issuer} approvers={ptw.approvers} location={ptw.location} created={ptw.createdAt} updated={ptw.updatedAt} />}
      />
    </DocPage>
  );
}
