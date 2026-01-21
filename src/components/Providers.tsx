"use client";

import React, { ReactNode } from "react";
import { CAPAProvider } from "../contexts/CAPAContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CAPAProvider>
      {children}
    </CAPAProvider>
  );
}
