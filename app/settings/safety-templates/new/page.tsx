"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewTemplate() {
  const router = useRouter();

  useEffect(() => {
    // The prototype opens a blank editor straight away, with a mock "new" id.
    router.replace("/settings/safety-templates/new-template-id");
  }, [router]);

  return null;
}
