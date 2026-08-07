import React from 'react';
import { Badge } from '@/components/ui/badge';

export const JhaRiskLevelBadge = ({ score }: { score: number }) => {
  const getRisk = (s: number) => {
    if (s <= 4) return { label: 'Low', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    if (s <= 9) return { label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { label: 'High', class: 'bg-red-50 text-red-700 border-red-100' };
  };
  const risk = getRisk(score);
  return <Badge className={risk.class}>{risk.label}</Badge>;
};

export const JhaRiskScoreBadge = ({ score }: { score: number }) => (
  <Badge variant="outline" className="font-mono">{score}</Badge>
);
