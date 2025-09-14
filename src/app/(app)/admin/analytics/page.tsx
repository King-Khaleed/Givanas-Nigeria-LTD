
'use client';

import PageHeader from "@/components/shared/page-header";
import StatCard from "@/components/shared/stat-card";
import { Users, Building, LineChart, CheckCircle, Loader2 } from "lucide-react";
import { OverviewChart } from "@/components/admin/analytics/overview-chart";
import { StatusPieChart } from "@/components/admin/analytics/status-pie-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { subMonths, format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';

type Activity = {
    id: string;
    user: { name: string; };
    organization: string;
    action: string;
    date: string;
    status: 'Success' | 'Failed' | 'Info';
    timestamp: string;
}

type AnalyticsData = {
    userCount: number;
    orgCount: number;
    totalAnalyses: number;
    analysisStats: { status: string; count: number; fill: string; }[];
    recentActivities: Activity[];
    overviewData: any[];
}

async function getAnalyticsData(): Promise<AnalyticsData> {
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
  const { count: totalAnalyses } = await supabase.from('financial_records').select('*', { count: 'exact', head: true });
  
  const { data: analysisStatsData, error: statsError } = await supabase
    .from('financial_records')
    .select('status')
    .in('status', ['completed', 'pending', 'failed']);

  if (statsError) console.error("Error fetching analysis stats:", statsError.message);

  const analysisStats = (analysisStatsData || []).reduce((acc, { status }) => {
    const key = status.charAt(0).toUpperCase() + status.slice(1);
    const existing = acc.find(item => item.status === key);
    if (existing) {
      existing.count++;
    } else {
       let fill = 'hsl(var(--muted))';
       if(key === 'Completed') fill = 'hsl(var(--chart-2))';
       if(key === 'Pending') fill = 'hsl(var(--chart-3))';
       if(key === 'Failed') fill = 'hsl(var(--chart-4))';
       acc.push({ status: key, count: 1, fill });
    }
    return acc;
  }, [] as { status: string, count: number, fill: string }[]);
  
  // --- Fetch Real Recent Activities ---
  const { data: newUsers } = await supabase.from('profiles').select('id, full_name, organization_name, created_at').order('created_at', { ascending: false }).limit(5);
  const { data: newUploads } = await supabase.from('financial_records').select('id, file_name, created_at, uploader:profiles(full_name), org:organizations(name)').order('created_at', { ascending: false }).limit(5);
  const { data: newReports } = await supabase.from('audit_reports').select('id, title, created_at, author:profiles(full_name), org:organizations(name)').order('created_at', { ascending: false }).limit(5);

  const activities: Activity[] = [];

  newUsers?.forEach(user => activities.push({
      id: `user-${user.id}`,
      user: { name: user.full_name },
      organization: user.organization_name ?? 'N/A',
      action: 'Registered a new account',
      date: formatDistanceToNow(new Date(user.created_at), { addSuffix: true }),
      status: 'Success',
      timestamp: user.created_at,
  }));
  
  (newUploads as any[])?.forEach(upload => activities.push({
      id: `upload-${upload.id}`,
      user: { name: upload.uploader?.full_name ?? 'Unknown' },
      organization: upload.org?.name ?? 'N/A',
      action: `Uploaded: ${upload.file_name}`,
      date: formatDistanceToNow(new Date(upload.created_at), { addSuffix: true }),
      status: 'Success',
      timestamp: upload.created_at,
  }));
  
  (newReports as any[])?.forEach(report => activities.push({
      id: `report-${report.id}`,
      user: { name: report.author?.full_name ?? 'Unknown' },
      organization: report.org?.name ?? 'N/A',
      action: `Generated Report: ${report.title}`,
      date: formatDistanceToNow(new Date(report.created_at), { addSuffix: true }),
      status: 'Success',
      timestamp: report.created_at,
  }));

  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // --- Dynamic Overview Data for User Sign-ups ---
  const today = new Date();
  const twelveMonthsAgo = subMonths(today, 11);
  const monthInterval = eachMonthOfInterval({ start: startOfMonth(twelveMonthsAgo), end: endOfMonth(today) });

  const monthlySignups = await Promise.all(
    monthInterval.map(async (monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());
      
      return {
        name: format(monthStart, 'MMM'),
        users: count || 0,
      };
    })
  );

  return {
    userCount: userCount ?? 0,
    orgCount: orgCount ?? 0,
    totalAnalyses: totalAnalyses ?? 0,
    analysisStats: analysisStats,
    recentActivities,
    overviewData: monthlySignups,
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData().then(data => {
        setData(data);
        setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const { userCount, orgCount, totalAnalyses, analysisStats, recentActivities, overviewData } = data;

  return (
    <div>
      <PageHeader title="Platform Analytics" description="Usage statistics and system metrics." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Users" 
            value={userCount.toString()}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="across all organizations"
        />
        <StatCard 
            title="Total Organizations" 
            value={orgCount.toString()}
            icon={<Building className="h-4 w-4 text-muted-foreground" />}
            description="currently on the platform"
        />
        <StatCard 
            title="Total Analyses Run" 
            value={totalAnalyses.toString()}
            icon={<LineChart className="h-4 w-4 text-muted-foreground" />}
            description="since platform launch"
        />
        <StatCard 
            title="System Uptime" 
            value="99.9%"
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            valueClassName="text-base text-green-600"
            description="in the last 30 days"
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mt-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>User sign-ups over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <OverviewChart data={overviewData} />
            </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Analysis Status</CardTitle>
                <CardDescription>Current status of all financial record analyses.</CardDescription>
            </CardHeader>
            <CardContent>
                <StatusPieChart data={analysisStats} />
            </CardContent>
        </Card>
      </div>
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Platform Activities</CardTitle>
          <CardDescription>A log of recent significant events across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.user.name}</TableCell>
                  <TableCell>{activity.organization}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell><Badge variant={activity.status === 'Success' ? 'default' : 'destructive'} className={activity.status === 'Success' ? 'bg-green-600' : ''}>{activity.status}</Badge></TableCell>
                </TableRow>
              ))}
               {recentActivities.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No recent activities to display.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
