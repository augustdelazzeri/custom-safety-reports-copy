"use client";

import React, { ReactNode } from "react";
import { ProfileProvider } from "../contexts/ProfileContext";
import { CAPAProvider } from "../contexts/CAPAContext";
import { SafetyEventProvider } from "../contexts/SafetyEventContext";
import { AccessPointProvider } from "../contexts/AccessPointContext";
import { Guard1275Provider } from "../contexts/Guard1275Context";
import { ExecutionProvider } from "../contexts/ExecutionContext";
import { AiFirstProvider } from "../contexts/AiFirstContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <SafetyEventProvider>
        <AccessPointProvider>
          <CAPAProvider>
            <Guard1275Provider>
              <ExecutionProvider>
                <AiFirstProvider>{children}</AiFirstProvider>
              </ExecutionProvider>
            </Guard1275Provider>
          </CAPAProvider>
        </AccessPointProvider>
      </SafetyEventProvider>
    </ProfileProvider>
  );
}