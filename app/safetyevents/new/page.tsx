"use client";

import { NewEventBasicForm, NewEventTemplateForm } from '@/components/events/create/mocks';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSION_KEYS } from '@shared/types/permissions.types';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage } from '@/components/redesign/ui';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewEventContent() {
  const { hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  return (
    <PageShell title="Report safety event" mainClassName="p-0">
      <RdPage title="Report a safety event" subtitle="Tell us what happened. Safety will route it to the right people.">
          {templateId ? (
            <NewEventTemplateForm templateId={templateId} />
          ) : (
            <NewEventBasicForm />
          )}
      </RdPage>
    </PageShell>
  );
}

export default function NewEvent() {
  return (
    <Suspense fallback={<PageShell title="Report safety event"><div /></PageShell>}>
      <NewEventContent />
    </Suspense>
  );
}
