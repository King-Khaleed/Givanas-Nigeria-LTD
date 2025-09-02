import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboard() {
    const supabase = createClient();

    const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: reportCount } = await supabase.from('audit_reports').select('*', { count: 'exact', head: true });

    const { data: recentActivities } = await supabase
        .from('activities')
        .select('*, user:profiles(full_name), organization:organizations(name)')
        .order('created_at', { ascending: false })
        .limit(5)


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the AuditWise platform.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">All registered orgs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount ?? 0}</div>
             <p className="text-xs text-muted-foreground">All active & inactive users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Optimal</div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>A log of recent user activities across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivities?.map((activity) => (
                         <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.user?.full_name}</TableCell>
                            <TableCell>{activity.organization?.name}</TableCell>
                            <TableCell>{activity.action}</TableCell>
                            <TableCell className="text-right">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
