"use client";

import { Block, Fact, Line, SubHead } from "@/components/screens/docs/kit";
import { RdCard } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Overview = ({ purpose, responsibilities }: any) => (
  <Block title="Overview">
    <dl className="grid gap-4">
      <Fact label="Purpose">{purpose}</Fact>
      <Fact label="Responsibilities">{responsibilities}</Fact>
    </dl>
  </Block>
);

const PHASES: [string, string][] = [
  ["pre_procedure", "Before you start"],
  ["procedure", "Procedure"],
  ["post_procedure", "After you finish"],
];

export const ProcedurePhases = ({ sectionGroups }: any) => (
  <Block title="Procedure steps">
    {PHASES.map(([phase, label]) => (
      <div key={phase} className="flex flex-col gap-2">
        <SubHead>{label}</SubHead>
        {sectionGroups[phase]?.length ? (
          sectionGroups[phase].map((s: any, i: number) => (
            <Line key={i}>
              <span className="font-medium">{s.label}:</span> {s.value}
            </Line>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nothing listed.</p>
        )}
      </div>
    ))}
  </Block>
);

export const RisksPanel = ({ sectionGroups }: any) => (
  <Block title="Risks and controls">
    {sectionGroups.step?.length ? (
      sectionGroups.step.map((s: any, i: number) => (
        <Line key={i} tone="warning">
          <span className="font-medium">{s.label}:</span> {s.value}
        </Line>
      ))
    ) : (
      <p className="text-sm text-muted-foreground">No risks listed.</p>
    )}
  </Block>
);

export const EmergenciesPanel = ({ sectionGroups }: any) => (
  <Block title="Emergency procedures">
    {sectionGroups.emergency?.length ? (
      sectionGroups.emergency.map((s: any, i: number) => (
        <Line key={i} tone="error">
          <span className="font-medium">{s.label}:</span> {s.value}
        </Line>
      ))
    ) : (
      <p className="text-sm text-muted-foreground">No emergency steps listed.</p>
    )}
  </Block>
);

export const ReferencePanel = ({ sectionGroups }: any) => (
  <Block title="References">
    {sectionGroups.general?.length ? (
      <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
        {sectionGroups.general.map((s: any, i: number) => (
          <li key={i}>
            {s.label}: {s.value}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground">No references.</p>
    )}
  </Block>
);

export const SopSteps = () => (
  <RdCard title="Procedure steps">
    <div className="p-4">
      <Button type="button" variant="outline" className="w-full border-dashed">
        + Add step
      </Button>
    </div>
  </RdCard>
);
