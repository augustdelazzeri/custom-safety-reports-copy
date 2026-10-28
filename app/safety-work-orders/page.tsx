import { redirect } from "next/navigation";

export default function SafetyWorkOrdersRedirect() {
  redirect("/work-orders");
}
