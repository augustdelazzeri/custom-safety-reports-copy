import { redirect } from "next/navigation";

/** Legacy CAPA ids ("c1") have no match in the new action records; capa-00xx ids map one to one. */
export default async function CapaRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(/^capa-\d+$/i.test(id) ? `/actions/${id.toLowerCase()}` : "/actions");
}
