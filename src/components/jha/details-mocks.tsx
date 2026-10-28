"use client";

import { RdBadge, RdCard } from "@/components/redesign/ui";
import { Fact, RiskBadge } from "@/components/screens/docs/kit";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const JhaRiskSummarySection = ({ highestInitialRiskScore, highestResidualRiskScore, totalSteps }: any) => (
  <RdCard title="Risk summary">
    <dl className="flex flex-col gap-4 p-4">
      <Fact label="Initial risk (highest)">
        <RiskBadge score={highestInitialRiskScore} withScore />
      </Fact>
      <Fact label="Residual risk (highest)">
        <RiskBadge score={highestResidualRiskScore} withScore />
      </Fact>
      <Fact label="Task steps">
        <RdBadge tone="neutral">{totalSteps}</RdBadge>
      </Fact>
    </dl>
  </RdCard>
);
