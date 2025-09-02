
import { createClient } from "@/lib/supabase/server";
import { ReportGeneratorForm } from "./_components/report-generator-form";

export default async function NewReportPage() {
  const supabase = createClient();
  const { data: records, error } = await supabase
    .from("financial_records")
    .select("id, file_name, created_at, risk_level")
    .eq('status', 'completed')
    .order("created_at", { ascending: false });

  if (error) {
    // Handle error appropriately
    console.error(error);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">New Audit Report</h1>
        <p className="text-muted-foreground">
          Configure and generate a new report from your analyzed records.
        </p>
      </div>
      <ReportGeneratorForm records={records ?? []} />
    </div>
  );
}
