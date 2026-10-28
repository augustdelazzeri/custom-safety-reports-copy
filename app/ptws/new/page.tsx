"use client";

import { PtwSteps } from "@/components/ptw/mocks";
import { ApprovalCard, DocPage, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { useRouter } from "next/navigation";

export default function NewPtw() {
  const router = useRouter();
  return (
    <DocPage breadcrumb="Permit" title="New permit" subtitle="Describe the job, its hazards and who signs off." back="/ptws">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required placeholder="e.g. Hot work in boiler room" className="md:col-span-2" />
          <TextField label="Permit type" required placeholder="e.g. Hot work" />
          <TextField label="Owner" required placeholder="Select owner" />
          <TextField label="Location" placeholder="Select location" />
          <TextField label="Emergency contact" placeholder="Name and phone" />
        </FormCard>
        <PtwSteps />
        <ApprovalCard description="Choose the people who approve this permit." />
        <FormFooter draft="Save as draft" submit="Submit for review" onCancel={() => router.push("/ptws")} />
      </div>
    </DocPage>
  );
}
