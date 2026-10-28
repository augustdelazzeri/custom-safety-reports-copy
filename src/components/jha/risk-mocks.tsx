"use client";

import { RdBadge } from "@/components/redesign/ui";
import { RiskBadge } from "@/components/screens/docs/kit";

export const JhaRiskLevelBadge = ({ score }: { score: number }) => <RiskBadge score={score} />;

export const JhaRiskScoreBadge = ({ score }: { score: number }) => <RdBadge tone="neutral">{score}</RdBadge>;
