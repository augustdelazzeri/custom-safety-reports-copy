"use client";

import React, { useState } from 'react';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage } from '@/components/redesign/ui';
import { RdAsk } from '@/components/redesign/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuditTable, Filters, AuditLoading, AuditError, AuditEmpty, AuditMobileView } from '@/components/audit/mocks';
import { trpc } from '@/providers/trpc';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AuditLog() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: audits, isLoading, error } = trpc.audit.list.useQuery();

  const handleResetFilters = () => setSearch('');

  return (
    <PageShell title="Audits and inspections" mainClassName="p-0">
      <RdPage
        title="Audits and inspections"
        subtitle="View and manage your organization's safety audits and inspections."
        actions={
          <Button className="gap-2" onClick={() => router.push('/audits/new')}>
            <Plus className="size-4" />
            Create audit
          </Button>
        }
      >
        <RdAsk value={search} onChange={setSearch} />
        <Filters />

        {error ? <AuditError /> : null}
        {isLoading ? <AuditLoading /> : null}
        {audits && audits.length === 0 && !isLoading && !error && <AuditEmpty onResetFilters={handleResetFilters} />}
        {!isMobile && audits && audits.length > 0 ? <AuditTable audits={audits} /> : null}
        {isMobile && audits && audits.length > 0 ? <AuditMobileView audits={audits} /> : null}
      </RdPage>
    </PageShell>
  );
}
