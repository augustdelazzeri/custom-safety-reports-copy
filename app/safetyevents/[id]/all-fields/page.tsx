"use client";

import { 
  EditEventBasicForm, 
  EditEventTemplateForm, 
  EditEventLoading, 
  EditEventError 
} from '@/components/events/edit/mocks';
import { trpc } from '@/providers/trpc';
import { useParams } from 'next/navigation';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage } from '@/components/redesign/ui';

export default function EditEvent() {
  const params = useParams();
  const eventId = params.id as string;

  const {
    data: event,
    isPending,
    isSuccess,
    error,
  } = trpc.event.getByIdForEdit.useQuery({ id: eventId });

  if (isPending) {
    return (
      <PageShell title="Edit event" mainClassName="p-0">
      <RdPage title="Edit event">
            <EditEventLoading />
      </RdPage>
    </PageShell>
    );
  }

  if (!isSuccess || !event) {
    return (
      <PageShell title="Edit event" mainClassName="p-0">
      <RdPage title="Edit event">
            <EditEventError />
      </RdPage>
    </PageShell>
    );
  }

  const eventFormTemplate = (event as any).eventFormTemplate;

  return (
    <PageShell title="Edit event" mainClassName="p-0">
      <RdPage title="Edit event">
          {eventFormTemplate ? (
            <EditEventTemplateForm eventId={eventId} event={event} eventFormTemplate={eventFormTemplate} />
          ) : (
            <EditEventBasicForm eventId={eventId} event={event} />
          )}
      </RdPage>
    </PageShell>
  );
}
