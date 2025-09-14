'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const saveReportSchema = z.object({
  title: z.string(),
  reportType: z.string(),
  reportData: z.any(),
  organizationId: z.string(),
  userId: z.string(),
});

export async function saveReport(values: z.infer<typeof saveReportSchema>) {
  const supabase = createClient();
  
  const { error } = await supabase.from('audit_reports').insert({
    title: values.title,
    report_data: values.reportData,
    organization_id: values.organizationId,
    generated_by: values.userId,
    // Other fields can be added here, e.g., report_type from values.reportType
  });

  if (error) {
    console.error("Error saving report:", error.message);
    return { error: `Failed to save report: ${error.message}` };
  }

  // Revalidate paths to ensure dashboard and report lists are updated
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/reports');
  revalidatePath('/admin/reports');

  return { success: true };
}
