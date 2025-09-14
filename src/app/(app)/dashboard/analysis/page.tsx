
'use client';

import PageHeader from "@/components/shared/page-header";
import { AnalysisView } from "@/components/dashboard/analysis-view";
import { type AnalyzeFinancialRecordOutput } from "@/ai/flows/automated-anomaly-detection";
import { Sidebar } from "@/components/dashboard/analysis-sidebar";
import { parseISO, isValid } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

type AnalysisResultWithRecordId = AnalyzeFinancialRecordOutput['analysisResults'] & { recordId: string };

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultWithRecordId[]>([]);
  const [loading, setLoading] = useState(true);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const risk = searchParams.get('risk');
  const types = searchParams.get('types');

  useEffect(() => {
    if (!user || !profile) return;

    const getAnalysisData = async () => {
        setLoading(true);
        let query = supabase
            .from('financial_records')
            .select('id, analysis_results, created_at, file_type')
            .eq('organization_id', profile.organization_id)
            .eq('status', 'completed')
            .neq('analysis_results', null);

        if (from && isValid(parseISO(from))) {
            query = query.gte('created_at', parseISO(from).toISOString());
        }
        if (to && isValid(parseISO(to))) {
            query = query.lte('created_at', parseISO(to).toISOString());
        }
        if (risk && risk !== 'all') {
            // Corrected the filter to use the 'risk_flags' column which is optimized for this query.
            query = query.eq('risk_flags->>overall', risk);
        }
        if (types) {
            const typeList = types.split(',');
            query = query.in('file_type', typeList);
        }

        const { data: records, error } = await query;
            
        if (error) {
            console.error("Error fetching analysis data:", error.message);
            setAnalysisResults([]);
        } else {
            const results = records.map(r => ({
                ...(r.analysis_results as AnalyzeFinancialRecordOutput['analysisResults']),
                recordId: r.id,
            }));
            setAnalysisResults(results);
        }
        setLoading(false);
    }
    
    getAnalysisData();

  }, [user, profile, from, to, risk, types]);


  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analysis Results" description="Review the findings and risk flags from your financial records." />
       {analysisResults.length === 0 && !searchParams.toString() ? (
        <div className="p-8 border-2 border-dashed rounded-lg text-center h-96 flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold">No Analysis Data Available</h2>
            <p className="text-muted-foreground">Upload and analyze some financial records to see your results.</p>
        </div>
        ) : (
        <div className="grid lg:grid-cols-5 gap-8">
            <Sidebar className="lg:col-span-1" />
            <div className="lg:col-span-4">
                <AnalysisView results={analysisResults} userRole={profile?.role ?? 'client'} />
                 {analysisResults.length === 0 && searchParams.toString() && (
                     <div className="p-8 border-2 border-dashed rounded-lg text-center h-96 flex flex-col justify-center items-center">
                        <h2 className="text-xl font-semibold">No Results Found</h2>
                        <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                    </div>
                 )}
            </div>
        </div>
       )}
    </div>
  );
}
