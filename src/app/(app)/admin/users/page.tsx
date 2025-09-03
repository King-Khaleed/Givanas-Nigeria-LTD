
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
} from "@/components/ui/dropdown-menu";
import { InviteUserButton } from "./_components/invite-user-button";


const statsCards = [
    { title: "Total Users", value: "2,847", change: "+8%", icon: Users },
    { title: "Active Users", value: "2,560", change: "89.9%", icon: UserCheck },
    { title: "Pending Invitations", value: "32", change: "Resend Invites", icon: UserPlus },
    { title: "Inactive Users", value: "255", change: "9.1%", icon: UserX },
]


export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const supabase = createClient();
  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams?.limit ? parseInt(searchParams.limit, 10) : 10;
  const search = searchParams?.search || undefined;

  let query = supabase
    .from('profiles')
    .select('*, organization:organizations(name)', { count: 'exact' });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  const { data: users, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

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
                    <p className="text-xs text-green-600">{card.change}</p>
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
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="client">Clients</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
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
