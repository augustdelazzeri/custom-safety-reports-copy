"use client";

import { Block, Fact, fmt } from "@/components/screens/docs/kit";
import { RdCard } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const GeneralInformationPanel = ({ type, startDate, endDate, scope, emergencyContact }: any) => (
  <Block title="General information">
    <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Fact label="Permit type">{type}</Fact>
      <Fact label="Period">
        {fmt(startDate)} to {fmt(endDate)}
      </Fact>
      <Fact label="Emergency contact">{emergencyContact}</Fact>
      <Fact label="Work scope">{scope}</Fact>
    </dl>
  </Block>
);

export const HazardsAndControlsPanel = () => (
  <Block title="Hazards and controls">
    <p className="text-sm text-muted-foreground">Hazard assessment and control measures.</p>
  </Block>
);

export const PtwSteps = () => (
  <RdCard title="Permit sections">
    <div className="p-4">
      <Button type="button" variant="outline" className="w-full border-dashed">
        + Add section
      </Button>
    </div>
  </RdCard>
);
