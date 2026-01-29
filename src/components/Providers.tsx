"use client";

import React, { ReactNode } from "react";
import { ProfileProvider } from "../contexts/ProfileContext";
import { CAPAProvider } from "../contexts/CAPAContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <CAPAProvider>
        {children}
      </CAPAProvider>
    </ProfileProvider>
  );
}
