"use client";

import { LotoSteps } from "@/components/loto/mocks";
import { ApprovalCard, DocPage, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { useRouter } from "next/navigation";

export default function NewLoto() {
  const router = useRouter();
  return (
    <DocPage breadcrumb="Lockout/tagout" title="New lockout/tagout" subtitle="List the energy sources and the order to isolate them." back="/lotos">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required placeholder="e.g. Lockout for main pump maintenance" className="md:col-span-2" />
          <TextField label="Department" placeholder="e.g. Maintenance" />
          <TextField label="Owner" required placeholder="Select owner" />
          <TextField label="Location" placeholder="Select location" />
          <TextField label="Asset" placeholder="Select asset" />
        </FormCard>
        <LotoSteps />
        <ApprovalCard description="Choose the people who approve this procedure." />
        <FormFooter draft="Save as draft" submit="Submit for review" onCancel={() => router.push("/lotos")} />
      </div>
    </DocPage>
  );
}
