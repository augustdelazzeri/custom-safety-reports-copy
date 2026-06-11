"use client";

import React, { ReactNode } from "react";
import { ProfileProvider } from "../contexts/ProfileContext";
import { CAPAProvider } from "../contexts/CAPAContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <OnboardingProvider>
        <CAPAProvider>
          {children}
        </CAPAProvider>
      </OnboardingProvider>
    </ProfileProvider>
  );
}
