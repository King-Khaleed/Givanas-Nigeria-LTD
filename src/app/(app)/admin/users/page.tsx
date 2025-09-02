
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./_components/users-table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserSearch } from "./_components/user-search";

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

       <div className="flex justify-between items-center">
        <UserSearch initialSearch={search} />
      </div>

      <UsersTable
        users={users ?? []}
        pageCount={pageCount}
      />
    </div>
  );
}
