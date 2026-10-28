"use client";

import { RdCard, RdPage, RdBadge } from "@/components/redesign/ui";
import { PageShell } from "@/components/three-cases/shell";
import { useRouter } from "next/navigation";

/** Low relevance: a plausible placeholder in the new design. */
export default function SubscriptionSettings() {
  const router = useRouter();
  return (
    <PageShell title="Settings" mainClassName="p-0">
      <RdPage title="Subscription" subtitle="Your plan and the seats in use." onBack={() => router.push("/settings")}>
        <RdCard title="Safety Professional">
          <div className="flex flex-col gap-4 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan</span>
              <RdBadge tone="accent">Active</RdBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid seats</span>
              <span className="tabular-nums">18 of 25 in use</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[72%] rounded-full bg-primary" />
            </div>
            <p className="text-text-subtle">Billing is not part of this prototype.</p>
          </div>
        </RdCard>
      </RdPage>
    </PageShell>
  );
}
