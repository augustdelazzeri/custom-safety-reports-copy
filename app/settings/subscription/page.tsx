"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/providers/trpc';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionSettings() {
  const usageQuery = trpc.subscription.getCurrentUsage.useQuery();
  const rolesQuery = trpc.ehsRole.list.useQuery();

  if (usageQuery.isLoading || !usageQuery.data) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <div className="p-8 text-center">Loading subscription details...</div>
        </div>
      </div>
    );
  }

  const { paidSeatCount, paidSeatLimit, availablePaidSeats, freeSeatCount } = usageQuery.data;
  const capacityPercent = (paidSeatCount / paidSeatLimit) * 100;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Subscription" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="container mx-auto max-w-5xl space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Subscription & Seats</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage your seat capacity and plan details.</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Seat Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>{paidSeatCount} / {paidSeatLimit} Seats Used</span>
                    <span className="text-sm font-medium text-muted-foreground self-end">{availablePaidSeats} available</span>
                  </div>
                  <Progress value={capacityPercent} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Paid Seats</span>
                    <span className="text-lg font-bold">{paidSeatCount}</span>
                  </div>
                  <div className="flex flex-col border-l pl-4">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Free Seats</span>
                    <span className="text-lg font-bold">{freeSeatCount}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button>Add Seats</Button>
                  <Button variant="outline">Reduce Capacity</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Seat Breakdown by Role</h2>
              <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Role</TableHead>
                      <TableHead>Seat Type</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolesQuery.data?.map((role: any) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={role.systemRoleKey === 'global_admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-50'}>
                            {role.systemRoleKey === 'global_admin' ? 'Paid Seat' : 'Free Seat'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{role.activeUserCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground italic">Paid seats are required for admin roles and certain advanced permissions.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
