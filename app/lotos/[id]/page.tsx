"use client";

import { DocumentExecutionBlock } from "@/components/execution/DocumentExecutionBlock";
import { DocPage, DocState, PeopleAside, RecordActions, RecordGrid, RecordMeta, fmt } from "@/components/screens/docs/kit";
import { EnergySourcesPanel, GeneralInformation, ProceduresPanel, SafetyProtocolsPanel } from "@/components/loto/mocks";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams } from "next/navigation";

export default function LotoDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.loto.getByInstanceId.useQuery({ id });
  const loto = withRec("loto", id, raw);

  if (error) return <DocState breadcrumb="Lockout/tagout" kind="error" what="this procedure" back="/lotos" />;
  if (isLoading || !loto) return <DocState breadcrumb="Lockout/tagout" kind="loading" what="the procedure" back="/lotos" />;

  return (
    <DocPage breadcrumb="Lockout/tagout" title={loto.title} eyebrow={loto.slug} record back="/lotos" actions={<RecordActions editPath={`/lotos/${id}/edit`} />} subtitle={<RecordMeta status={loto.status} version={loto.version} items={[["Owner", loto.owner?.fullName], ["Last updated", fmt(loto.updatedAt)], ["Next review", fmt(loto.reviewDate)]]} />}>
      <RecordGrid
        main={
          <>
            <DocumentExecutionBlock docType="loto" docId={loto.id} docTitle={loto.title} />
            <GeneralInformation department={loto.department} procedures={loto.procedureGroups.general} />
            <EnergySourcesPanel energySources={loto.energySources} />
            <ProceduresPanel procedures={loto.procedureGroups.procedure} preProcedures={loto.procedureGroups.pre_procedure} postProcedures={loto.procedureGroups.post_procedure} />
            <SafetyProtocolsPanel />
          </>
        }
        aside={<PeopleAside owner={loto.owner} issuer={loto.issuer} approvers={loto.approvers} location={loto.location} assets={loto.asset ? [loto.asset] : []} created={loto.createdAt} updated={loto.updatedAt} />}
      />
    </DocPage>
  );
}
