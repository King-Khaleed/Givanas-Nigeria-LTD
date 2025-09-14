
'use server';

import { revalidatePath } from 'next/cache';
import { type AnalyzeFinancialRecordOutput } from '@/ai/flows/automated-anomaly-detection';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import * as xlsx from 'xlsx';

// --- Start of New Rule-Based Analysis Engine ---

type Transaction = {
  [key: string]: any;
  'Transaction ID'?: string;
  'Date'?: string | number;
  'Amount'?: number;
};

function runRuleBasedAnalysis(jsonData: Transaction[]): AnalyzeFinancialRecordOutput['analysisResults'] {
  const anomalies: AnalyzeFinancialRecordOutput['analysisResults']['anomalies'] = [];
  const complianceIssues: AnalyzeFinancialRecordOutput['analysisResults']['complianceIssues'] = [];
  
  const HIGH_VALUE_THRESHOLD = 10000;
  const transactionIds = new Set<string>();

  // Rule 1: Detect High-Value Transactions
  jsonData.forEach((row, index) => {
    const amount = row['Amount'] || row['amount'];
    if (typeof amount === 'number' && amount > HIGH_VALUE_THRESHOLD) {
      anomalies.push({
        type: 'High-Value Transaction',
        description: `Transaction amount of $${amount.toFixed(2)} exceeds the threshold of $${HIGH_VALUE_THRESHOLD}.`,
        severity: 'Medium',
        recordReference: `Row ${index + 2}`,
      });
    }
  });

  // Rule 2: Detect Duplicate Transaction IDs
  jsonData.forEach((row, index) => {
      const transId = row['Transaction ID'] || row['transaction_id'] || row['id'];
      if (transId) {
          const idString = String(transId);
          if (transactionIds.has(idString)) {
              anomalies.push({
                  type: 'Duplicate Transaction',
                  description: `Duplicate Transaction ID #${idString} found.`,
                  severity: 'High',
                  recordReference: `Row ${index + 2}`,
              });
          }
          transactionIds.add(idString);
      }
  });

  // Rule 3: Detect Weekend Transactions
  jsonData.forEach((row, index) => {
      const dateValue = row['Date'] || row['date'];
      if (dateValue) {
          // Excel dates can be numbers, so we handle that.
          const date = typeof dateValue === 'number' ? new Date(Math.round((dateValue - 25569) * 86400 * 1000)) : new Date(dateValue);
          if (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
              anomalies.push({
                  type: 'Weekend Activity',
                  description: `Transaction occurred on a weekend (${date.toLocaleDateString()}).`,
                  severity: 'Low',
                  recordReference: `Row ${index + 2}`,
              });
          }
      }
  });

  const overallRiskLevel = anomalies.some(a => a.severity === 'High') ? 'High'
                         : anomalies.some(a => a.severity === 'Medium') ? 'Medium'
                         : 'Low';

  return {
    summary: `Rule-based analysis complete. Found ${anomalies.length} potential anomalies.`,
    anomalies,
    complianceIssues, // Kept for schema consistency
    overallRiskLevel,
  };
}

// --- End of New Rule-Based Analysis Engine ---


export async function deleteRecord(recordId: string) {
  const supabase = createAdminClient();

  const { data: record, error: fetchError } = await supabase
    .from('financial_records')
    .select('id, organization_id, file_path')
    .eq('id', recordId)
    .single();

  if (fetchError || !record) {
    return { error: 'Record not found.' };
  }

  const { error: storageError } = await supabase.storage.from('financial-records').remove([record.file_path]);
  if (storageError) {
      console.error("Error deleting from storage, but continuing to delete record:", storageError.message);
  }

  const { error: deleteError } = await supabase.from('financial_records').delete().eq('id', recordId);

  if (deleteError) {
    return { error: `Failed to delete record: ${deleteError.message}` };
  }

  revalidatePath('/dashboard/records');
  return { success: true };
}


const getFileType = (fileName: string): 'PDF' | 'Excel' | 'CSV' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'PDF';
    if (extension === 'xls' || extension === 'xlsx') return 'Excel';
    return 'CSV';
}


export async function uploadAndAnalyzeRecord(
    userId: string,
    organizationId: string,
    fileDataUri: string,
    fileName: string,
    organizationName: string
) {
    const supabase = createAdminClient();
    
    const base64Data = fileDataUri.split(',')[1];
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileType = getFileType(fileName);
    const fileSize = fileBuffer.length;
    
    const filePath = `${organizationId}/${uuidv4()}-${fileName}`;

    // Step 1: Upload file to storage
    const { error: uploadError } = await supabase.storage
        .from('financial-records')
        .upload(filePath, fileBuffer, {
            contentType: fileDataUri.split(':')[1].split(';')[0],
            upsert: false,
        });

    if (uploadError) {
        return { error: `Storage upload failed: ${uploadError.message}` };
    }

    // Step 2: Create record in database with "pending" status
    const { data: record, error: recordError } = await supabase
        .from('financial_records')
        .insert({
            file_name: fileName,
            file_path: filePath,
            file_size: fileSize,
            file_type: fileType,
            status: 'pending', 
            uploaded_by: userId,
            organization_id: organizationId,
        })
        .select()
        .single();
    
    if (recordError || !record) {
        // If DB insert fails, roll back the storage upload
        await supabase.storage.from('financial-records').remove([filePath]);
        return { error: `Failed to create record in database: ${recordError?.message}` };
    }

    // Step 3: Return success without running AI analysis to prevent timeouts
    revalidatePath('/dashboard/records');
    revalidatePath('/dashboard');
    return { success: true, recordId: record.id };
}


export async function runAnalysisOnRecord(recordId: string, organizationName: string) {
    const supabase = createAdminClient();

    const { data: record } = await supabase
        .from('financial_records')
        .select('*')
        .eq('id', recordId)
        .single();

    if (!record) {
        return { error: "Record not found" };
    }
    
    if (record.status !== 'pending') {
        return { error: `Record is not in a pending state. Current status: ${record.status}.`};
    }

    await supabase.from('financial_records').update({ status: 'analyzing' }).eq('id', record.id);
    revalidatePath('/dashboard/records');

    let analysisResults;

    try {
        if (record.file_type === 'PDF') {
            // Handle PDFs with a placeholder result
            analysisResults = {
                summary: 'Automated analysis for PDF files is not supported in this version. The record has been marked as complete.',
                anomalies: [],
                complianceIssues: [],
                overallRiskLevel: 'Low',
            };
        } else {
            // Handle Excel/CSV with rule-based engine
            const { data: fileData, error: downloadError } = await supabase.storage.from('financial-records').download(record.file_path);
            if (downloadError) {
                throw new Error(`Failed to download file: ${downloadError.message}`);
            }

            const fileBuffer = await fileData.arrayBuffer();
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json<Transaction>(worksheet);

            analysisResults = runRuleBasedAnalysis(jsonData);
        }

        const { error: updateError } = await supabase
            .from('financial_records')
            .update({ 
                status: 'completed', 
                analysis_results: analysisResults as any,
                risk_flags: { overall: analysisResults.overallRiskLevel } as any
            })
            .eq('id', record.id);
        
        if (updateError) {
            throw new Error(`Failed to save analysis results: ${updateError.message}`);
        }

        revalidatePath('/dashboard/records');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/analysis');
        return { success: true };

    } catch (error: any) {
        await supabase
            .from('financial_records')
            .update({ status: 'failed' })
            .eq('id', record.id);
        
        revalidatePath('/dashboard/records');
        return { error: `Analysis failed: ${error.message}` };
    }
}
