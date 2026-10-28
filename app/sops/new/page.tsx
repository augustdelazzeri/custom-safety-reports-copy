"use client";

import { SopSteps } from "@/components/sop/mocks";
import { ApprovalCard, DateField, DocPage, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { useRouter } from "next/navigation";

export default function NewSop() {
  const router = useRouter();
  return (
    <DocPage breadcrumb="Procedure" title="New procedure" subtitle="Write the steps, the risks and who approves it." back="/sops">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required placeholder="e.g. Boiler startup procedure" className="md:col-span-2" />
          <TextField label="Owner" required placeholder="Select owner" />
          <TextField label="Location" placeholder="Select location" />
          <TextField label="Linked job hazard analysis" placeholder="Search analyses" />
          <DateField label="Next review" />
        </FormCard>
        <SopSteps />
        <ApprovalCard description="Choose the people who approve this procedure." />
        <FormFooter draft="Save as draft" submit="Submit for review" onCancel={() => router.push("/sops")} />
      </div>
    </DocPage>
  );
}
