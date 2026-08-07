"use client";

import { NewEventBasicForm, NewEventTemplateForm } from '@/components/events/create/mocks';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSION_KEYS } from '@shared/types/permissions.types';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewEventContent() {
  const { hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Report Safety Event" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {templateId ? (
            <NewEventTemplateForm templateId={templateId} />
          ) : (
            <NewEventBasicForm />
          )}
        </main>
      </div>
    </div>
  );
}

export default function NewEvent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewEventContent />
    </Suspense>
  );
}
