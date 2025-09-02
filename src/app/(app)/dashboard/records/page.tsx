
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { RecordsTable } from "./_components/records-table";
import { RecordSearch } from "./_components/record-search";

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
    const limit = searchParams?.limit ? parseInt(searchParams.limit, 10) : 10;
    const search = searchParams?.search || undefined;
    
    let records = [];
    let recordCount = 0;

    if (user) {
        const { data: profile } = await supabase.from('profiles').select('organization_id').single();
        if (profile?.organization_id) {
            let query = supabase
                .from('financial_records')
                .select('*', { count: 'exact' })
                .eq('organization_id', profile.organization_id);

            if (search) {
                query = query.ilike('file_name', `%${search}%`);
            }
            
            const { data, count, error } = await query
                .range((page - 1) * limit, page * limit - 1)
                .order('created_at', { ascending: false });

            if (error) console.error(error);
            
            records = data ?? [];
            recordCount = count ?? 0;
        }
    }

    const pageCount = Math.ceil(recordCount / limit);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Financial Records</h1>
        <p className="text-muted-foreground">
          Manage, search, and analyze all your uploaded financial documents.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
          <CardDescription>You have {recordCount} records in total.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center py-4">
                <RecordSearch initialSearch={search} />
            </div>
            <RecordsTable records={records} pageCount={pageCount} />
        </CardContent>
      </Card>
    </div>
  );
}
