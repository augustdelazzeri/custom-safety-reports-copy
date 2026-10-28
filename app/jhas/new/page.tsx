"use client";

import { JhaSteps } from "@/components/jha/mocks";
import { AreaField, ApprovalCard, DateField, DocPage, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { useRouter } from "next/navigation";

export default function NewJha() {
  const router = useRouter();
  return (
    <DocPage breadcrumb="Job hazard analysis" title="New job hazard analysis" subtitle="Assess the hazards of a task and how each one is controlled." back="/jhas">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required placeholder="e.g. Working at heights for roof repair" className="md:col-span-2" />
          <TextField label="Reference ID" placeholder="e.g. JHA-2026-001" />
          <TextField label="Owner" required placeholder="Select owner" />
          <TextField label="Location" placeholder="Select location" />
          <TextField label="Assets" placeholder="Select assets" />
          <DateField label="Next review" />
          <AreaField label="Notes" placeholder="Add notes or context" className="md:col-span-2" />
        </FormCard>
        <JhaSteps />
        <ApprovalCard description="Choose the people who approve this analysis." />
        <FormFooter draft="Save as draft" submit="Submit for review" onCancel={() => router.push("/jhas")} />
      </div>
    </DocPage>
  );
}
