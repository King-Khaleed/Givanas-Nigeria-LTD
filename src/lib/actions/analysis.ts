'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateRiskFlagStatus(recordId: string, flagId: string, status: 'Reviewed' | 'Resolved') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  const { data: profile } = await supabase.from('profiles').select('role, organization_id').eq('id', user.id).single();
  if (profile?.role !== 'staff') {
    return { error: 'Not authorized' };
  }

  const { data: record, error: fetchError } = await supabase
    .from('financial_records')
    .select('analysis_results, organization_id')
    .eq('id', recordId)
    .single();

  if (fetchError || !record) {
    return { error: 'Record not found.' };
  }
  
  if (record.organization_id !== profile.organization_id) {
      return { error: 'You do not have permission to modify this record.' };
  }

  const analysisResults = record.analysis_results as any;
  if (!analysisResults) {
      return { error: 'Analysis results not found for this record.' };
  }

  let flagUpdated = false;

  if (analysisResults.anomalies) {
    analysisResults.anomalies = analysisResults.anomalies.map((anomaly: any, index: number) => {
        const currentFlagId = `${recordId}-anomaly-${index}`;
        if (currentFlagId === flagId) {
            flagUpdated = true;
            return { ...anomaly, status };
        }
        return anomaly;
    });
  }
  
  if (!flagUpdated && analysisResults.complianceIssues) {
      analysisResults.complianceIssues = analysisResults.complianceIssues.map((issue: any, index: number) => {
          const currentFlagId = `${recordId}-compliance-${index}`;
          if (currentFlagId === flagId) {
              flagUpdated = true;
              return { ...issue, status };
          }
          return issue;
      });
  }

  if (!flagUpdated) {
      return { error: 'Specified risk flag not found in the record.' };
  }

  const { error: updateError } = await supabase
    .from('financial_records')
    .update({ analysis_results: analysisResults })
    .eq('id', recordId);

  if (updateError) {
    return { error: `Failed to update record: ${updateError.message}` };
  }

  revalidatePath('/dashboard/analysis');

  return { success: true };
}
