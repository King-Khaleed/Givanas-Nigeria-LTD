'use client';

import PageHeader from '@/components/shared/page-header';
import StatCard from '@/components/shared/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Building, Users, Activity, CheckCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

type AdminDashboardData = {
    orgCount: number;
    userCount: number;
    activeAnalysesCount: number;
    recentActivities: any[];
    newUsers: any[];
}

async function getAdminDashboardData(): Promise<AdminDashboardData> {

  const { count: orgCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  const { count: activeAnalysesCount } = await supabase
    .from('financial_records')
    .select('*', { count: 'exact', head: true })
    .in('status', ['processing', 'analyzing']);
    
  const { data: recentActivities, error: activitiesError } = await supabase
    .from('activities')
    .select(`
        id,
        created_at,
        action,
        details,
        profiles (
            full_name,
            email
        )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: newUsers, error: newUsersError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (activitiesError) console.error("Error fetching activities:", activitiesError.message);
  if (newUsersError) console.error("Error fetching new users:", newUsersError.message);

  return {
    orgCount: orgCount ?? 0,
    userCount: userCount ?? 0,
    activeAnalysesCount: activeAnalysesCount ?? 0,
    recentActivities: recentActivities ?? [],
    newUsers: newUsers ?? [],
  };
}


export default function AdminDashboardPage() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const userAvatars = PlaceHolderImages.filter(img => img.id.startsWith('user-avatar'));

    useEffect(() => {
        getAdminDashboardData().then(data => {
            setData(data);
            setLoading(false);
        });
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    const { orgCount, userCount, activeAnalysesCount, recentActivities, newUsers } = data;

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Admin Dashboard"
        description="Oversee platform activity and user management."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Organizations"
          value={orgCount.toString()}
          icon={<Building className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Users"
          value={userCount.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active Analyses"
          value={activeAnalysesCount.toString()}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="currently processing"
        />
        <StatCard
          title="System Status"
          value="All Systems Normal"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          valueClassName="text-base text-green-600 dark:text-green-400"
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>An overview of the latest activities on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity: any) => {
                    const avatar = userAvatars.find(a => a.id === `user-avatar-${(activity.id.charCodeAt(0) % 3) + 1}`);
                    const userName = activity.profiles?.full_name ?? 'System';
                    return (
                        <TableRow key={activity.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={avatar?.imageUrl} alt={userName} />
                                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{userName}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="text-sm text-foreground">{activity.action}</p>
                                    <p className="text-xs text-muted-foreground">{activity.details?.fileName || ''}</p>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </TableCell>
                        </TableRow>
                    )
                })}
                 {recentActivities.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                            No recent activities.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
         <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>New Users</CardTitle>
            <CardDescription>Recently joined users this month.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {newUsers.map((user: any, index) => {
                 const avatar = userAvatars.find(a => a.id === `user-avatar-${(user.id.charCodeAt(0) % 3) + 1}`);
                 return (
                    <div className="flex items-center gap-4" key={user.id}>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={avatar?.imageUrl} alt="Avatar" />
                            <AvatarFallback>{user.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="ml-auto font-medium">
                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'staff' ? 'secondary' : 'outline'}>{user.role}</Badge>
                        </div>
                    </div>
                 )
            })}
            {newUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No new users this month.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
