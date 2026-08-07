"use client";

import { 
  EditEventBasicForm, 
  EditEventTemplateForm, 
  EditEventLoading, 
  EditEventError 
} from '@/components/events/edit/mocks';
import { trpc } from '@/providers/trpc';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <EditEventLoading />
          </main>
        </div>
      </div>
    );
  }

  if (!isSuccess || !event) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <EditEventError />
          </main>
        </div>
      </div>
    );
  }

  const eventFormTemplate = (event as any).eventFormTemplate;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Edit Event" />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {eventFormTemplate ? (
            <EditEventTemplateForm eventId={eventId} event={event} eventFormTemplate={eventFormTemplate} />
          ) : (
            <EditEventBasicForm eventId={eventId} event={event} />
          )}
        </main>
      </div>
    </div>
  );
}
