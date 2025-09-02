
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateExecutiveSummary } from '@/ai/flows/generate-executive-summary';

const generateReportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  recordIds: z.array(z.string()).min(1, 'You must select at least one record.'),
});

export async function generateReport(values: z.infer<typeof generateReportSchema>) {
  const supabase = createClient();
  const validatedFields = generateReportSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: profile } = await supabase.from('profiles').select('organization_id').single();
   if (!profile || !profile.organization_id) {
    return { error: 'User organization not found.' };
  }

  const { title, recordIds } = validatedFields.data;

  // 1. Fetch the selected financial records to compile their data
  const { data: records, error: recordsError } = await supabase
    .from('financial_records')
    .select('id, file_name, analysis_results')
    .in('id', recordIds);

  if (recordsError) {
    return { error: `Database Error: ${recordsError.message}` };
  }
  
  if (!records || records.length === 0) {
      return { error: 'No valid records found for the selected IDs.' };
  }

  // 2. Format the data for the AI flow
  const financialRecordsString = records
    .map(r => `File: ${r.file_name}\nAnalysis: ${JSON.stringify(r.analysis_results, null, 2)}`)
    .join('\n\n---\n\n');

  // 3. Create the initial report in 'draft' status
  const { data: newReport, error: insertError } = await supabase
    .from('audit_reports')
    .insert({
      title,
      organization_id: profile.organization_id,
      generated_by: user.id,
      status: 'draft',
    })
    .select()
    .single();

    if (insertError) {
        return { error: `Database Error: ${insertError.message}` };
    }

    // Log activity
    await supabase.from('activities').insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        action: `Started generating report: ${title}`,
        details: { reportId: newReport.id }
    });
    
  // 4. Trigger the AI flow asynchronously (but we'll await it here for simplicity)
  try {
    const summaryResult = await generateExecutiveSummary({
      financialRecords: financialRecordsString,
    });

    // 5. Update the report with the AI-generated content
    const { error: updateError } = await supabase
      .from('audit_reports')
      .update({
        summary: summaryResult.summary,
        key_metrics: summaryResult.keyMetrics,
        top_risk_areas: summaryResult.topRiskAreas,
        recommendations: summaryResult.recommendations,
        status: 'final',
      })
      .eq('id', newReport.id);
      
    if (updateError) {
        throw new Error(updateError.message);
    }

     await supabase.from('activities').insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        action: `Successfully generated report: ${title}`,
        details: { reportId: newReport.id }
    });
    
  } catch (aiError: any) {
     await supabase
      .from('audit_reports')
      .update({ status: 'failed' })
      .eq('id', newReport.id);

      await supabase.from('activities').insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        action: `Failed to generate report: ${title}`,
        details: { reportId: newReport.id, error: aiError.message }
      });
    return { error: `AI Generation Failed: ${aiError.message}` };
  }
  
  // 6. Revalidate paths and redirect
  revalidatePath('/dashboard/reports');
  revalidatePath(`/dashboard/reports/${newReport.id}`);
  redirect(`/dashboard/reports/${newReport.id}`);
}
