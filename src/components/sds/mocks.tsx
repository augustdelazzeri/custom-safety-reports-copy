"use client";

import { RdBadge } from "@/components/redesign/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const SdsSignalWordBadge = ({ signalWord }: any) => (
  <RdBadge tone={String(signalWord).toLowerCase() === "danger" ? "error" : "warning"}>
    <span className="capitalize">{signalWord}</span>
  </RdBadge>
);

export const GHSPictogramList = ({ pictograms }: any) => (
  <div className="flex flex-wrap gap-2">
    {pictograms.map((p: string) => (
      <RdBadge key={p} tone="neutral">
        <span className="capitalize">{p}</span>
      </RdBadge>
    ))}
  </div>
);
