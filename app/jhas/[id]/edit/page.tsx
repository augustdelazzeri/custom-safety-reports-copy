"use client";

import { JhaSteps } from "@/components/jha/mocks";
import { AreaField, ApprovalCard, DocPage, DocState, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams, useRouter } from "next/navigation";

export default function EditJha() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.jha.getByInstanceIdForEdit.useQuery({ id });
  const d = withRec("jha", id, raw);

  if (error) return <DocState breadcrumb="Job hazard analysis" kind="error" what="this job hazard analysis" back={`/jhas/${id}`} />;
  if (isLoading || !d) return <DocState breadcrumb="Job hazard analysis" kind="loading" what="the job hazard analysis" back={`/jhas/${id}`} />;

  return (
    <DocPage breadcrumb="Job hazard analysis" title="Edit job hazard analysis" eyebrow={`${d.slug} · Version ${d.version}`} subtitle="Saving creates a new version that goes back through approval." back="history">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required defaultValue={d.title} className="md:col-span-2" />
          <TextField label="Reference ID" defaultValue={d.referenceId} />
          <TextField label="Owner" required defaultValue={d.ownerId} />
          <AreaField label="Notes" defaultValue={d.notes} className="md:col-span-2" />
        </FormCard>
        <JhaSteps />
        <ApprovalCard description="Update the people who approve this analysis." />
        <FormFooter draft="Save changes" submit="Submit revision" onCancel={() => router.back()} />
      </div>
    </DocPage>
  );
}
