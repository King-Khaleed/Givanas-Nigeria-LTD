
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./_components/users-table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const page = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams.limit) : 10;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;

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
    // Handle error appropriately
  }

  const pageCount = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Users</h1>
        <p className="text-muted-foreground">
          Manage all users on the platform.
        </p>
      </div>

       <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            defaultValue={search}
            // onChange handler would require client component and state management
          />
        </div>

      <UsersTable
        users={users ?? []}
        pageCount={pageCount}
      />
    </div>
  );
}
