"use client";

import { DocumentExecutionBlock } from "@/components/execution/DocumentExecutionBlock";
import { JhaRiskSummarySection } from "@/components/jha/details-mocks";
import { JhaRiskLevelBadge, JhaRiskScoreBadge } from "@/components/jha/risk-mocks";
import { RdCard } from "@/components/redesign/ui";
import { Block, DocPage, DocState, Fact, Line, PeopleAside, RecordActions, RecordGrid, RecordMeta, SubHead, fmt } from "@/components/screens/docs/kit";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function JhaDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.jha.getByInstanceId.useQuery({ id });
  const jha = withRec("jha", id, raw);

  if (error) return <DocState breadcrumb="Job hazard analysis" kind="error" what="this analysis" back="/jhas" />;
  if (isLoading || !jha) return <DocState breadcrumb="Job hazard analysis" kind="loading" what="the analysis" back="/jhas" />;

  return (
    <DocPage breadcrumb="Job hazard analysis" title={jha.title} eyebrow={jha.slug} record back="/jhas" actions={<RecordActions editPath={`/jhas/${id}/edit`} />} subtitle={<RecordMeta status={jha.status} version={jha.version} items={[["Owner", jha.owner?.fullName], ["Last reviewed", fmt(jha.updatedAt)], ["Next review", fmt(jha.nextReviewDate)]]} />}>
      <RecordGrid
        main={
          <>
            <DocumentExecutionBlock docType="jha" docId={jha.id} docTitle={jha.title} />
            <RdCard title="Task steps and risk assessment">
              <div className="flex flex-col gap-4 p-4">
                {jha.steps.map((step: any) => {
                  const score = step.severity * step.likelihoodAfterControl;
                  return (
                    <div key={step.id} className="overflow-hidden rounded-lg border border-border">
                      <div className="flex items-center justify-between gap-3 bg-surface-subtle p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">{step.serial}</span>
                          <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <JhaRiskScoreBadge score={score} />
                          <JhaRiskLevelBadge score={score} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-4 p-4">
                        <p className="text-sm text-foreground">{step.description}</p>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <SubHead>Hazards</SubHead>
                            {step.hazards.map((h: any) => (
                              <Line key={h.id} tone="warning">{h.name}</Line>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <SubHead>Controls</SubHead>
                            {step.controlMeasures.map((c: any) => (
                              <Line key={c.id}>{c.name}</Line>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RdCard>
            <Block title="General information">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Fact label="Type">{jha.type}</Fact>
                <Fact label="Location">{jha.location?.name}</Fact>
                <Fact label="Description">{jha.description}</Fact>
                <Fact label="Notes">{jha.notes}</Fact>
              </dl>
            </Block>
          </>
        }
        aside={
          <>
            <JhaRiskSummarySection highestInitialRiskScore={jha.highestInitialRiskScore} highestResidualRiskScore={jha.highestResidualRiskScore} totalSteps={jha.steps.length} />
            <PeopleAside owner={jha.owner} approvers={jha.approvers} location={jha.location} created={jha.createdAt} updated={jha.updatedAt} />
          </>
        }
      />
    </DocPage>
  );
}
