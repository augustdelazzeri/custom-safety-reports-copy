"use client";

import { PtwSteps } from "@/components/ptw/mocks";
import { ApprovalCard, DocPage, DocState, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams, useRouter } from "next/navigation";

export default function EditPtw() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.ptw.getByInstanceIdForEdit.useQuery({ id });
  const d = withRec("ptw", id, raw);

  if (error) return <DocState breadcrumb="Permit" kind="error" what="this permit" back={`/ptws/${id}`} />;
  if (isLoading || !d) return <DocState breadcrumb="Permit" kind="loading" what="the permit" back={`/ptws/${id}`} />;

  return (
    <DocPage breadcrumb="Permit" title="Edit permit" eyebrow={`${d.slug} · Version ${d.version}`} subtitle="Saving creates a new version that goes back through approval." back="history">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required defaultValue={d.title} className="md:col-span-2" />
          <TextField label="Permit type" required defaultValue={d.type} />
          <TextField label="Owner" required defaultValue={d.ownerId} />
        </FormCard>
        <PtwSteps />
        <ApprovalCard description="Update the people who approve this permit." />
        <FormFooter draft="Save changes" submit="Submit revision" onCancel={() => router.back()} />
      </div>
    </DocPage>
  );
}
