"use client";

import { InboxScreen } from "@/components/screens/inbox/screen";

/**
 * A1 · Use case 3 is finishing work orders. The list on the left is the Events > Corrective actions
 * pattern (events, CAPAs and documents, open ones, compact rows, a few filters); on the right the
 * work orders of the selected one, ready to close. With no work order the only action is Create.
 */
export default function A1Page() {
  return <InboxScreen variant="a1" />;
}
