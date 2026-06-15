"use client";

import React, { ReactNode } from "react";
import { ProfileProvider } from "../contexts/ProfileContext";
import { CAPAProvider } from "../contexts/CAPAContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { SafetyEventProvider } from "../contexts/SafetyEventContext";
import { AccessPointProvider } from "../contexts/AccessPointContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <OnboardingProvider>
        <SafetyEventProvider>
          <AccessPointProvider>
            <CAPAProvider>
              {children}
            </CAPAProvider>
          </AccessPointProvider>
        </SafetyEventProvider>
      </OnboardingProvider>
    </ProfileProvider>
  );
}
