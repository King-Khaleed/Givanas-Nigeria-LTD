'use client';

import PageHeader from "@/components/shared/page-header";
import { RecordsTable } from "@/components/dashboard/records-table";
import type { Record } from './data';
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

async function getRecords(organizationId: string): Promise<Record[]> {
  const { data: records, error } = await supabase
    .from('financial_records')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching records:", error.message);
    return [];
  }

  return records.map(record => ({
    id: record.id,
    fileName: record.file_name,
    fileType: record.file_type as "PDF" | "Excel" | "CSV",
    uploadDate: record.created_at,
    fileSize: record.file_size,
    status: record.status as "pending" | "processing" | "completed" | "failed",
    riskLevel: (record.risk_flags as any)?.overall as "High" | "Medium" | "Low" | undefined,
  }));
}

export default function RecordsPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      getRecords(profile.organization_id).then(records => {
        setData(records);
        setLoading(false);
      });
    }
  }, [profile]);

  if (loading) {
     return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Records Management" description="View and manage all your uploaded financial records." />
      <RecordsTable data={data} userRole={profile?.role ?? 'client'} />
    </div>
  );
}
