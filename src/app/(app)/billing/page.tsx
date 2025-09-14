'use client';

import PageHeader from '@/components/shared/page-header';
import StatCard from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { startOfMonth, endOfMonth } from 'date-fns';
import { FileUp, LineChart, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type UsageStats = {
  uploadsThisMonth: number;
  analysesThisMonth: number;
};

async function getUsageStats(organizationId: string): Promise<UsageStats> {
  const now = new Date();
  const start = startOfMonth(now).toISOString();
  const end = endOfMonth(now).toISOString();

  const { count: uploadsThisMonth } = await supabase
    .from('financial_records')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', start)
    .lte('created_at', end);

  const { count: analysesThisMonth } = await supabase
    .from('financial_records')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .gte('created_at', start)
    .lte('created_at', end);

  return {
    uploadsThisMonth: uploadsThisMonth ?? 0,
    analysesThisMonth: analysesThisMonth ?? 0,
  };
}

export default function BillingPage() {
  const { profile } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      getUsageStats(profile.organization_id).then((data) => {
        setUsage(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Billing & Usage"
        description="Manage your subscription, payment methods, and view usage."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the Free Plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">Free</div>
            <p className="text-xs text-muted-foreground">
              Includes basic features and limited usage.
            </p>
          </CardContent>
          <CardFooter>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* The button is wrapped in a span for the tooltip to work when disabled */}
                  <span tabIndex={0}>
                    <Button disabled className="w-full">
                      Upgrade Plan
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrading plans is coming soon!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            <StatCard
                title="Files Uploaded"
                value={usage?.uploadsThisMonth.toString() ?? '0'}
                icon={<FileUp className="h-4 w-4 text-muted-foreground" />}
                description="in the current billing cycle"
            />
            <StatCard
                title="Analyses Run"
                value={usage?.analysesThisMonth.toString() ?? '0'}
                icon={<LineChart className="h-4 w-4 text-muted-foreground" />}
                description="in the current billing cycle"
            />
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            A record of your past invoices and payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No billing history found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
