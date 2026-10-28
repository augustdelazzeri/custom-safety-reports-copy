import { redirect } from "next/navigation";

/** Settings live in one page now; this old address lands on its tab. */
export default function Page() {
  redirect("/settings?tab=locations");
}
