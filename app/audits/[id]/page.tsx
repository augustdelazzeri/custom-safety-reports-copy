"use client";

import React from 'react';
import { PageShell } from '@/components/three-cases/shell';
import { RdPage, RdBadge, RdCard } from '@/components/redesign/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MoreVertical, 
  Send, 
  Check, 
  CheckCircle2,
  X, 
  Edit, 
  History, 
  Download, 
  Copy, 
  Archive, 
  Trash2,
  User,
  FileText,
  Clock,
  Calendar,
  ArrowLeft,
  ChevronRight,
  Share2,
  ExternalLink
} from 'lucide-react';
import { 
  GeneralInformationPanel,
  LinkedItemsPanel,
  DetailSidebar,
  AuditPersonnelSection,
  ApproversSection,
  LocationAndAssetsSection,
  TimelineSection,
  AuditDetailsLoading,
  AuditDetailsError
} from '@/components/audit/details/mocks';
import { DocumentExecutionBlock } from '@/components/execution/DocumentExecutionBlock';
import { SplitScreenVariant } from '@/components/execution/variants/SplitScreenVariant';
import { StepperVariant } from '@/components/execution/variants/StepperVariant';
import { TabsVariant } from '@/components/execution/variants/TabsVariant';
import { CompactBarVariant } from '@/components/execution/variants/CompactBarVariant';
import { InterfaceVariantPicker, useInterfaceVariant } from '@/components/execution/InterfaceVariantPicker';
import { trpc } from '@/providers/trpc';
import { useRouter, useParams } from 'next/navigation';

export default function AuditDetails() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id as string;
  const { data: audit, isLoading, error } = trpc.audit.getByInstanceId.useQuery({ id });
  const { variant, setVariant } = useInterfaceVariant();

  if (isLoading || !audit) return <AuditDetailsLoading />;
  if (error) return <AuditDetailsError />;

  return (
    <PageShell title="Audit details" mainClassName="p-0">
      <RdPage
        record
        onBack={() => router.push('/audits')}
        eyebrow={audit.slug}
        title={audit.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <RdBadge>v{audit.version}</RdBadge>
            {audit.status === 'Approved/Active' ? <RdBadge tone="success">{audit.status}</RdBadge> : null}
            <span>Owner: <span className="font-medium text-foreground">{audit.owner?.fullName}</span></span>
            <span>Approvers: <span className="font-medium text-foreground">August Delazzeri</span></span>
            <span>Last reviewed: <span className="font-medium text-foreground">{audit.lastReviewed}</span></span>
          </span>
        }
        actions={
          <>
            <InterfaceVariantPicker variant={variant} onChange={setVariant} />
            <Button variant="outline">Submit for review</Button>
            <Button className="gap-2">
              <Download className="size-4" />
              Export PDF
            </Button>
          </>
        }
      >
          <div className="w-full">
            <div className="mb-8">
              {variant === 'top-blocks' && (
                <DocumentExecutionBlock docType="audit" docId={audit.id} docTitle={audit.title} />
              )}
              {variant === 'split-screen' && (
                <SplitScreenVariant docType="audit" docId={audit.id} docTitle={audit.title} />
              )}
              {variant === 'stepper' && (
                <StepperVariant docType="audit" docId={audit.id} docTitle={audit.title} />
              )}
              {variant === 'tabs' && (
                <TabsVariant
                  docType="audit"
                  docId={audit.id}
                  docTitle={audit.title}
                  summary={{
                    description: audit.description,
                    ownerName: audit.owner?.fullName,
                    status: audit.status,
                    locationName: audit.location?.name,
                  }}
                />
              )}
              {variant === 'compact-bar' && (
                <CompactBarVariant docType="audit" docId={audit.id} docTitle={audit.title} />
              )}
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2 space-y-6">
                <GeneralInformationPanel
                  type={audit.type} 
                  description={audit.description}
                  locationName={audit.location?.name}
                />
                     <LinkedItemsPanel
                       checklists={audit.checklists}
                       workOrders={audit.workOrders}
                       pms={audit.pms}
                       auditId={audit.id}
                       auditTitle={audit.title}
                     />
              </div>

              <div className="lg:col-span-1 border border-border rounded-[var(--lab-radius)] bg-card p-6 space-y-0 divide-y divide-border">
                <div className="pb-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="size-4" />
                    <h4 className="text-sm font-semibold">Personnel</h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Owner</span>
                    <p className="text-sm font-medium text-foreground">{audit.owner?.fullName}</p>
                  </div>
                </div>
                <div className="py-6">
                  <ApproversSection approvers={audit.approvers} approverFlow={audit.approverFlow} />
                </div>
                <div className="py-6">
                  <LocationAndAssetsSection location={audit.location} />
                </div>
                <div className="pt-6">
                  <TimelineSection activity={audit.activity} />
                </div>
              </div>
            </div>
          </div>
      </RdPage>
    </PageShell>
  );
}
