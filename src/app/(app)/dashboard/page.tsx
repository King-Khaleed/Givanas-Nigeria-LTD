'use client';

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
  ListChecks,
  PlusCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  File as FileIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/page-header';
import StatCard from '@/components/shared/stat-card';
import { useAuth } from '@/context/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { redirect, useRouter } from 'next/navigation';


const getStatusUi = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        badgeVariant: 'default' as const,
        badgeClass: 'bg-green-600',
      };
    case 'processing':
    case 'analyzing':
      return {
        icon: Loader2,
        badgeVariant: 'secondary' as const,
        badgeClass: 'animate-spin',
      };
    case 'pending':
      return {
        icon: Clock,
        badgeVariant: 'secondary' as const,
        badgeClass: '',
      };
    case 'failed':
      return {
        icon: AlertCircle,
        badgeVariant: 'destructive' as const,
        badgeClass: '',
      };
    default:
      return {
        icon: FileIcon,
        badgeVariant: 'outline' as const,
        badgeClass: '',
      };
  }
};

type DashboardData = {
    recentUploads: any[];
    stats: {
        completed: number;
        highRisk: number;
        inQueue: number;
    };
    recentReports: any[];
}


export default function DashboardPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !profile) return;
        
        const getDashboardData = async () => {
            const { organization_id } = profile;
            if (!organization_id) {
                setLoading(false);
                return;
            };

            const { data: recentUploads, error: uploadsError } = await supabase
                .from('financial_records')
                .select('*')
                .eq('organization_id', organization_id)
                .order('created_at', { ascending: false })
                .limit(3);

            const { count: completedCount, error: completedError } = await supabase
                .from('financial_records')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', organization_id)
                .eq('status', 'completed');

            const { count: inQueueCount, error: inQueueError } = await supabase
                .from('financial_records')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', organization_id)
                .in('status', ['pending', 'processing', 'analyzing']);
            
            const { data: highRiskRecords, error: highRiskError } = await supabase
                .from('financial_records')
                .select('risk_flags')
                .eq('organization_id', organization_id)
                .eq('risk_flags->>overall', 'High');
                
            const highRiskFlagsCount = highRiskRecords?.length ?? 0;

            const { data: recentReports, error: reportsError } = await supabase
                .from('audit_reports')
                .select('id, title, created_at')
                .eq('organization_id', organization_id)
                .order('created_at', { ascending: false })
                .limit(3);

            if (uploadsError) console.error('Error fetching recent uploads:', uploadsError.message);
            if (reportsError) console.error('Error fetching recent reports:', reportsError.message);
            if (completedError) console.error('Error fetching completed count:', completedError.message);
            if (inQueueError) console.error('Error fetching in-queue count:', inQueueError.message);
            if (highRiskError) console.error('Error fetching high-risk count:', highRiskError.message);

            setData({
                recentUploads: recentUploads ?? [],
                stats: {
                    completed: completedCount ?? 0,
                    highRisk: highRiskFlagsCount,
                    inQueue: inQueueCount ?? 0,
                },
                recentReports: recentReports ?? [],
            });
            setLoading(false);
        }

        if (profile.role === 'admin') {
            router.replace('/admin');
        } else {
            getDashboardData();
        }
    }, [user, profile, router]);

    if (loading || !data) {
       return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const { recentUploads, stats, recentReports } = data;

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's a quick overview of your account."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload Records</CardTitle>
            <CardDescription>
              Upload financial documents for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/upload" className="block p-8 border-2 border-dashed rounded-lg text-center h-64 flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors">
              <PlusCircle className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">
                Ready to start?
              </p>
              <p className="text-sm text-muted-foreground">
                Click here to upload your documents.
              </p>
            </Link>
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-sm">Recent Uploads</h3>
              {recentUploads.map((upload) => {
                const statusUI = getStatusUi(upload.status);
                return (
                 <div
                  key={upload.id}
                  className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <statusUI.icon className={`w-4 h-4 ${statusUI.badgeClass}`} />
                    <span>{upload.file_name}</span>
                  </div>
                  <Badge
                    variant={statusUI.badgeVariant}
                    className={statusUI.badgeVariant === 'default' ? statusUI.badgeClass : ''}
                  >
                    {upload.status}
                  </Badge>
                </div>
                )
                })}
                 {recentUploads.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-4">
                        No recent uploads found.
                    </div>
                )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/upload">
                <PlusCircle className="mr-2 h-4 w-4" /> Start New Upload
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Status</CardTitle>
              <CardDescription>Summary of your file analyses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">High-Risk Flags</span>
                <span className="font-bold text-destructive">{stats.highRisk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">In Queue</span>
                <span className="font-bold">{stats.inQueue}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/analysis">
                  <ListChecks className="mr-2 h-4 w-4" /> View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest generated reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{report.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="#">Download</Link>
                  </Button>
                </div>
              ))}
               {recentReports.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-4">
                        No recent reports found.
                    </div>
                )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/dashboard/reports">
                  <FileText className="mr-2 h-4 w-4" /> Generate New Report
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
