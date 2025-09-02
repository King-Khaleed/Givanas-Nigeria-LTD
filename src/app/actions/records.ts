
'use server';

import {createClient} from '@/lib/supabase/server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {v4 as uuidv4} from 'uuid';
import type { Database } from '@/lib/types';
import { automatedComplianceChecks } from '@/ai/flows/automated-compliance-checks';
import { Buffer } from 'buffer';

type FinancialRecordInsert = Database["public"]["Tables"]["financial_records"]["Insert"];
type FinancialRecord = Database["public"]["Tables"]["financial_records"]["Row"];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
];

const signedUrlSchema = z.object({
  fileType: z.string().refine(type => ALLOWED_FILE_TYPES.includes(type), {
    message: 'Invalid file type.',
  }),
  fileSize: z.number().max(MAX_FILE_SIZE, {
    message: `File size cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
  }),
  organizationId: z.string().uuid(),
});

export async function getSignedUrl(values: z.infer<typeof signedUrlSchema>) {
  const supabase = createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const validatedFields = signedUrlSchema.safeParse(values);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.message);
  }

  const {fileType, organizationId} = validatedFields.data;
  const extension = fileType.split('/')[1];
  const path = `${organizationId}/${user.id}/${uuidv4()}.${extension}`;

  const {data: url, error} = await supabase.storage
    .from('financial-records')
    .createSignedUploadUrl(path);

  if (error) {
    throw new Error(error.message);
  }

  return {url, path};
}


export async function createFinancialRecord(values: FinancialRecordInsert): Promise<FinancialRecord> {
    const supabase = createClient();
     const {
        data: {user},
     } = await supabase.auth.getUser();

     if (!user) {
        throw new Error('Not authenticated');
     }

    const recordData = {
        ...values,
        uploaded_by: user.id
    };

    const {data, error} = await supabase.from('financial_records').insert(recordData).select().single();

    if (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
    
    revalidatePath('/dashboard/records');
    revalidatePath('/dashboard');
    return data;
}

export async function getDownloadUrl(formData: FormData) {
    const path = formData.get('path') as string;
    if (!path) {
        throw new Error("File path is missing.");
    }
    const supabase = createClient();
    const { data, error } = await supabase.storage.from('financial-records').createSignedUrl(path, 60); // 60 seconds expiry

    if(error) {
        throw new Error(error.message);
    }
    
    redirect(data.signedUrl);
}

const complianceCheckSchema = z.object({
    recordId: z.string(),
    filePath: z.string(),
    fileType: z.string(),
});


export async function runComplianceCheck(values: z.infer<typeof complianceCheckSchema>) {
    const supabase = createClient();
    const { recordId, filePath, fileType } = values;

    try {
        // 1. Update record status to 'processing'
        await supabase.from('financial_records').update({ status: 'processing' }).eq('id', recordId);
        revalidatePath('/dashboard/records');

        // 2. Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage.from('financial-records').download(filePath);
        if (downloadError) throw new Error(`Failed to download file: ${downloadError.message}`);

        // 3. Convert file to base64 data URI
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const dataUri = `data:${fileType};base64,${buffer.toString('base64')}`;
        
        // 4. Run Genkit AI flow
        const analysisResult = await automatedComplianceChecks({
            financialDocumentDataUri: dataUri,
        });

        // 5. Update record with analysis results
        await supabase.from('financial_records').update({
            status: 'completed',
            risk_level: analysisResult.riskLevel,
            analysis_results: analysisResult as any, // Cast to any to store as JSONB
        }).eq('id', recordId);

    } catch (error: any) {
        // 6. Handle errors
        await supabase.from('financial_records').update({ status: 'failed' }).eq('id', recordId);
        console.error(`Analysis failed for record ${recordId}:`, error);
    } finally {
        // 7. Revalidate paths
        revalidatePath('/dashboard/records');
        revalidatePath(`/dashboard/records/${recordId}`);
    }
}
