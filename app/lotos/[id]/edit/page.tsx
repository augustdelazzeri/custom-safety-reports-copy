"use client";

import { LotoSteps } from "@/components/loto/mocks";
import { ApprovalCard, DocPage, DocState, FormCard, FormFooter, TextField } from "@/components/screens/docs/kit";
import { withRec } from "@/lib/screens/docs";
import { trpc } from "@/providers/trpc";
import { useParams, useRouter } from "next/navigation";

export default function EditLoto() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: raw, isLoading, error } = trpc.loto.getByInstanceIdForEdit.useQuery({ id });
  const d = withRec("loto", id, raw);

  if (error) return <DocState breadcrumb="Lockout/tagout" kind="error" what="this lockout/tagout procedure" back={`/lotos/${id}`} />;
  if (isLoading || !d) return <DocState breadcrumb="Lockout/tagout" kind="loading" what="the lockout/tagout procedure" back={`/lotos/${id}`} />;

  return (
    <DocPage breadcrumb="Lockout/tagout" title="Edit lockout/tagout procedure" eyebrow={`${d.slug} · Version ${d.version}`} subtitle="Saving creates a new version that goes back through approval." back="history">
      <div className="flex max-w-5xl flex-col gap-6">
        <FormCard title="Basic information">
          <TextField label="Title" required defaultValue={d.title} className="md:col-span-2" />
          <TextField label="Department" defaultValue={d.department} />
          <TextField label="Owner" required defaultValue={d.ownerId} />
        </FormCard>
        <LotoSteps />
        <ApprovalCard description="Update the people who approve this procedure." />
        <FormFooter draft="Save changes" submit="Submit revision" onCancel={() => router.back()} />
      </div>
    </DocPage>
  );
}
