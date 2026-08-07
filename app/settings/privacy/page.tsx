"use client";

import { PrivacyTab } from "@/components/settings/mocks";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function PrivacySettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and application preferences.</p>
            </div>
            <div className="border-t pt-6">
              <PrivacyTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
