"use client";

import React, { ReactNode } from "react";
import { ProfileProvider } from "../contexts/ProfileContext";
import { CAPAProvider } from "../contexts/CAPAContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { SafetyEventProvider } from "../contexts/SafetyEventContext";
import { AccessPointProvider } from "../contexts/AccessPointContext";
import { Guard1275Provider } from "../contexts/Guard1275Context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <OnboardingProvider>
        <SafetyEventProvider>
          <AccessPointProvider>
            <CAPAProvider>
              <Guard1275Provider>
                {children}
              </Guard1275Provider>
            </CAPAProvider>
          </AccessPointProvider>
        </SafetyEventProvider>
      </OnboardingProvider>
    </ProfileProvider>
  );
}