import { redirect } from "next/navigation";

export default function SafetyWorkOrderRedirect() {
  redirect("/work-orders");
}
