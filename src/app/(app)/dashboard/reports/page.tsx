
'use client';

import PageHeader from "@/components/shared/page-header";
import { ReportGenerator } from "@/components/dashboard/report-generator";
import { useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


export default function ReportsPage() {
    const { profile } = useAuth();
    const [availableRecords, setAvailableRecords] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile || !profile.organization_id) {
            setLoading(false);
            return;
        }

        const getCompletedRecords = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('financial_records')
                .select('id, file_name')
                .eq('organization_id', profile.organization_id)
                .eq('status', 'completed');
            
            if (error) {
                console.error("Error fetching completed records:", error.message);
                setAvailableRecords([]);
            } else {
                setAvailableRecords(data.map(r => ({ id: r.id, name: r.file_name })));
            }
            setLoading(false);
        }

        getCompletedRecords();

    }, [profile]);

    if (!profile || loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const organizationName = profile.organization_name ?? "DefaultCorp";
    
  return (
    <div className="space-y-6">
      <PageHeader title="Report Generator" description="Create and download custom audit reports." />
      <ReportGenerator 
        organizationName={organizationName}
        availableRecords={availableRecords}
        userRole={profile.role}
      />
    </div>
  );
}
