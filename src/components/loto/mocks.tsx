"use client";

import { Block, Fact, Line, SubHead } from "@/components/screens/docs/kit";
import { RdBadge, RdCard } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const GeneralInformation = ({ department, procedures }: any) => (
  <Block title="General information">
    <dl className="grid gap-4">
      <Fact label="Department">{department}</Fact>
      <Fact label="General procedures">
        <ul className="list-disc space-y-1 pl-5">
          {procedures.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Fact>
    </dl>
  </Block>
);

export const EnergySourcesPanel = ({ energySources }: any) => (
  <Block title="Energy sources">
    {energySources.map((es: any) => (
      <div key={es.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{es.name}</h4>
          <RdBadge tone="neutral">{es.type}</RdBadge>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <Fact label="Isolation point">{es.isolationPoint}</Fact>
          <Fact label="Method">{es.isolationMethod}</Fact>
        </dl>
      </div>
    ))}
  </Block>
);

export const ProceduresPanel = ({ procedures, preProcedures, postProcedures }: any) => (
  <Block title="Procedures">
    {(
      [
        ["Before you start", preProcedures],
        ["Lockout", procedures],
        ["After you finish", postProcedures],
      ] as [string, string[]][]
    ).map(([label, list]) => (
      <div key={label} className="flex flex-col gap-2">
        <SubHead>{label}</SubHead>
        {list.map((p, i) => (
          <Line key={i}>{p}</Line>
        ))}
      </div>
    ))}
  </Block>
);

export const SafetyProtocolsPanel = () => (
  <Block title="Safety protocols">
    <p className="text-sm text-muted-foreground">Safety protocols and emergency contact information.</p>
  </Block>
);

export const LotoSteps = () => (
  <RdCard title="Lockout steps">
    <div className="p-4">
      <Button type="button" variant="outline" className="w-full border-dashed">
        + Add step
      </Button>
    </div>
  </RdCard>
);
