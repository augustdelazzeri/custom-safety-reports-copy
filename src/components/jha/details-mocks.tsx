import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JhaRiskLevelBadge } from '@/components/jha/mocks';

export const JhaRiskSummarySection = ({ highestInitialRiskScore, highestResidualRiskScore, totalSteps }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Risk Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm">Initial Risk (Max)</span>
        <Badge variant="outline" className="bg-red-50 text-red-700">{highestInitialRiskScore}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold">Residual Risk (Max)</span>
        <JhaRiskLevelBadge score={highestResidualRiskScore} />
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm">Total Task Steps</span>
        <span className="text-sm font-bold">{totalSteps}</span>
      </div>
    </CardContent>
  </Card>
);

export const JhaDetailsLoading = () => <div className="p-8 text-center text-muted-foreground">Loading JHA details...</div>;
export const JhaDetailsError = () => <div className="p-8 text-center text-destructive">Error loading JHA.</div>;
export const JhaVersionHistory = () => null;
export const JhaConfirmationDialog = () => null;
