
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./_components/users-table";
import { UserSearch } from "./_components/user-search";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, UserCheck, UserX, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { InviteUserButton } from "./_components/invite-user-button";


export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const page = searchParams?.page ? parseInt(searchParams.page as string, 10) : 1;
  const limit = searchParams?.limit ? parseInt(searchParams.limit as string, 10) : 10;
  const search = searchParams?.search as string | undefined;
  const role = searchParams?.role as 'admin' | 'staff' | 'client' | undefined;
  const status = searchParams?.status as 'active' | 'inactive' | 'pending' | undefined;

  let query = supabase
    .from('profiles')
    .select('*, organization:organizations(name)', { count: 'exact' });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,organization:organizations.name.ilike.%${search}%`);
  }
  
  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  if (status && status !== 'all') {
    query = query.eq('is_active', status === 'active');
  }

  const { data: users, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    // Handle error appropriately
  }

  const { data: stats } = await supabase.rpc('get_user_stats');

  const statsCards = [
    { title: "Total Users", value: stats?.total_users ?? 0, change: "+8%", icon: Users },
    { title: "Active Users", value: stats?.active_users ?? 0, change: `${stats?.total_users ? ((stats?.active_users ?? 0) / stats.total_users * 100).toFixed(1) : 0}%`, icon: UserCheck },
    { title: "Pending Invitations", value: 0, change: "Resend Invites", icon: UserPlus }, // Placeholder
    { title: "Inactive Users", value: stats?.inactive_users ?? 0, change: `${stats?.total_users ? ((stats?.inactive_users ?? 0) / stats.total_users * 100).toFixed(1) : 0}%`, icon: UserX },
  ];

  const pageCount = count ? Math.ceil(count / limit) : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users across organizations and their access levels.
          </p>
        </div>
        <InviteUserButton />
      </div>

       {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(card => (
            <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>


      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
              <UserSearch initialSearch={search} />
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Status: All</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All</DropdownMenuItem>
                    <DropdownMenuItem>Active</DropdownMenuItem>
                    <DropdownMenuItem>Inactive</DropdownMenuItem>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <Button variant="outline">Clear Filters</Button>
              </div>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue={role ?? "all"}>
              <TabsList>
                <Link href="?role=all"><TabsTrigger value="all">All Users</TabsTrigger></Link>
                <Link href="?role=admin"><TabsTrigger value="admin">Admins</TabsTrigger></Link>
                <Link href="?role=staff"><TabsTrigger value="staff">Staff</TabsTrigger></Link>
                <Link href="?role=client"><TabsTrigger value="client">Clients</TabsTrigger></Link>
              </TabsList>
              <TabsContent value={role ?? "all"}>
                 <UsersTable
                    users={users ?? []}
                    pageCount={pageCount}
                  />
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
