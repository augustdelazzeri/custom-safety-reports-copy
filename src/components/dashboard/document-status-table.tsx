import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DASHBOARD_SAFETY_DOCUMENTS_ID } from '@/lib/dashboard-kpi-navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@shared/ROUTE_PATHS';
import type { DocumentStatsOutput } from '@shared/types/dashboard.types';
import { useEffect } from 'react';
import Link from 'next/link';

// Mock translation
const t = (key: string) => {
  const map: Record<string, string> = {
    'dashboard.safetyDocuments.title': 'Safety Documents',
    'dashboard.safetyDocuments.emptyState': 'No documents found',
    'dashboard.safetyDocuments.columns.module': 'Module',
    'dashboard.safetyDocuments.columns.draft': 'Draft',
    'dashboard.safetyDocuments.columns.review': 'In Review',
    'dashboard.safetyDocuments.columns.approved': 'Approved',
    'dashboard.safetyDocuments.columns.total': 'Total',
  };
  return map[key] || key;
};

const MODULE_LABELS: Record<string, string> = {
  loto: 'LOTO',
  ptw: 'PTW',
  sop: 'SOP',
  jha: 'JHA',
  audit: 'Audit',
};

type DocumentStatusTableProps = {
  data: DocumentStatsOutput | null | undefined | any;
  isLoading: boolean;
  highlighted?: boolean;
};

const MODULE_ROUTES = {
  loto: ROUTES.EVENT_LIST, // Mocking to existing routes
  ptw: ROUTES.EVENT_LIST,
  sop: ROUTES.EVENT_LIST,
  jha: ROUTES.CAPA_LIST,
  audit: ROUTES.CAPA_LIST,
} as const;

type ModuleKey = keyof typeof MODULE_ROUTES;

const MODULE_KEYS = Object.keys(MODULE_ROUTES) as ModuleKey[];

export const DocumentStatusTable = ({ data, isLoading, highlighted = false }: DocumentStatusTableProps) => {
  const cardClassName = cn(highlighted && 'ring-2 ring-ring transition-shadow');

  useEffect(() => {
    if (!highlighted) return;
    document.getElementById(DASHBOARD_SAFETY_DOCUMENTS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [highlighted]);

  if (isLoading) {
    return (
      <Card id={DASHBOARD_SAFETY_DOCUMENTS_ID} className={cardClassName}>
        <CardHeader>
          <CardTitle>{t('dashboard.safetyDocuments.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Handle both production structure and mock structure
  const modules = data
    ? MODULE_KEYS.flatMap((key) => {
        const stats = data[key] || { draft: 0, review: 0, approved: 0 };
        return [{ key, name: MODULE_LABELS[key], ...stats, total: (stats.draft || 0) + (stats.review || 0) + (stats.approved || 0) }];
      })
    : [];

  if (modules.length === 0) {
    return (
      <Card id={DASHBOARD_SAFETY_DOCUMENTS_ID} className={cardClassName}>
        <CardHeader>
          <CardTitle>{t('dashboard.safetyDocuments.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('dashboard.safetyDocuments.emptyState')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id={DASHBOARD_SAFETY_DOCUMENTS_ID} className={cardClassName}>
      <CardHeader>
        <CardTitle>{t('dashboard.safetyDocuments.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('dashboard.safetyDocuments.columns.module')}</TableHead>
              <TableHead>{t('dashboard.safetyDocuments.columns.draft')}</TableHead>
              <TableHead>{t('dashboard.safetyDocuments.columns.review')}</TableHead>
              <TableHead>{t('dashboard.safetyDocuments.columns.approved')}</TableHead>
              <TableHead>{t('dashboard.safetyDocuments.columns.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map(({ key, name, draft, review, approved, total }) => (
              <TableRow key={key}>
                <TableCell>
                  <Link href={(MODULE_ROUTES as any)[key] ?? '#'} className="text-primary hover:underline">
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{draft}</TableCell>
                <TableCell className={cn(review > 0 && 'bg-amber-100 font-medium dark:bg-amber-950/50')}>
                  {review}
                </TableCell>
                <TableCell>{approved}</TableCell>
                <TableCell>{total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
