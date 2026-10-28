"use client";

import { SopSteps } from "@/components/sop/mocks";
import { ApprovalCard, DocPage, DocState, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams, useRouter } from "next/navigation";

export default function EditSop() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.sop.getByInstanceIdForEdit.useQuery({ id });
  const d = withRec("sop", id, raw);

  if (error) return <DocState breadcrumb="Procedure" kind="error" what="this procedure" back={`/sops/${id}`} />;
  if (isLoading || !d) return <DocState breadcrumb="Procedure" kind="loading" what="the procedure" back={`/sops/${id}`} />;

  return (
    <DocPage breadcrumb="Procedure" title="Edit procedure" eyebrow={`${d.slug} · Version ${d.version}`} subtitle="Saving creates a new version that goes back through approval." back="history">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required defaultValue={d.title} className="md:col-span-2" />
          <TextField label="Owner" required defaultValue={d.ownerId} />
        </FormCard>
        <SopSteps />
        <ApprovalCard description="Update the people who approve this procedure." />
        <FormFooter draft="Save changes" submit="Submit revision" onCancel={() => router.back()} />
      </div>
    </DocPage>
  );
}
