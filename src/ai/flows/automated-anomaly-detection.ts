
'use server';

/**
 * @fileOverview Implements the Automated Anomaly Detection flow for financial records.
 *
 * - analyzeFinancialRecord - Analyzes financial records for anomalies, risks, and compliance issues.
 * - AnalyzeFinancialRecordInput - Input type for analyzeFinancialRecord function.
 * - AnalyzeFinancialRecordOutput - Return type for analyzeFinancialRecord function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFinancialRecordInputSchema = z.object({
  fileContent: z
    .string()
    .describe(
      "The content of a financial record file. This can be a Data URI for a PDF, or a plain text CSV string for Excel/CSV files."
    ),
  fileType: z.enum(['PDF', 'Excel', 'CSV']).describe('The type of the financial record file.'),
  fileName: z.string().describe('The name of the financial record file.'),
  organizationName: z.string().describe('The name of the organization.'),
});
export type AnalyzeFinancialRecordInput = z.infer<typeof AnalyzeFinancialRecordInputSchema>;

const AnomalyDetectionResultSchema = z.object({
  summary: z.string().describe('A summary of the analysis results.'),
  anomalies: z.array(
    z.object({
      type: z.string().describe('The type of anomaly detected.'),
      description: z.string().describe('A detailed description of the anomaly.'),
      severity: z.enum(['Low', 'Medium', 'High']).describe('The severity level of the anomaly.'),
      recordReference: z.string().describe('A reference to the specific record where the anomaly was detected.'),
    })
  ).describe('A list of anomalies detected in the financial record.'),
  complianceIssues: z.array(
    z.object({
      type: z.string().describe('The type of compliance issue.'),
      description: z.string().describe('A detailed description of the compliance issue.'),
      severity: z.enum(['Low', 'Medium', 'High']).describe('The severity level of the compliance issue.'),
      recommendations: z.string().describe('Recommendations for resolving the compliance issue.'),
    })
  ).describe('A list of compliance issues detected in the financial record.'),
  overallRiskLevel: z.enum(['Low', 'Medium', 'High']).describe('The overall risk level assessment for the financial record.'),
});

const AnalyzeFinancialRecordOutputSchema = z.object({
  analysisResults: AnomalyDetectionResultSchema.describe('The results of the anomaly detection analysis.'),
});
export type AnalyzeFinancialRecordOutput = z.infer<typeof AnalyzeFinancialRecordOutputSchema>;

// Note: This flow is no longer actively used by the `runAnalysisOnRecord` action.
// It has been replaced by a rule-based engine in `src/lib/actions/records.ts`.
// It is kept here for reference or future re-integration.
export async function analyzeFinancialRecord(input: AnalyzeFinancialRecordInput): Promise<AnalyzeFinancialRecordOutput> {
  return analyzeFinancialRecordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFinancialRecordPrompt',
  input: {schema: AnalyzeFinancialRecordInputSchema},
  output: {schema: AnalyzeFinancialRecordOutputSchema},
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
    ]
  },
  prompt: `You are an AI-powered financial audit assistant for an organization named {{{organizationName}}}. Your task is to analyze financial records for anomalies, potential risks, and compliance issues.

  You will be provided with financial data for a file named {{{fileName}}}.
  The file type is {{{fileType}}}.

  The content is provided below.
  - If the File Type is 'PDF', the content is a Data URI. You must analyze the document content embedded within this URI.
  - If the File Type is 'Excel' or 'CSV', the content is a plain text string in CSV format. You must analyze this text directly.

  File Content: {{{fileContent}}}

  Based on your analysis of the file content, please perform the following:
  1.  **Summarize Findings**: Write a concise summary of your analysis.
  2.  **Identify Anomalies**: Detect at least 2-3 potential anomalies from the data (e.g., duplicate transactions, unusual amounts, out-of-hours activity). For each, provide a type, a detailed description, a severity level (Low, Medium, or High), and a reference to where it was found (e.g., line number, transaction ID).
  3.  **Identify Compliance Issues**: Look for potential compliance problems (e.g., missing approvals, policy violations). If any are found, describe them, assess their severity, and provide a clear recommendation for resolution. If none are found, state that clearly.
  4.  **Assess Overall Risk**: Based on the number and severity of anomalies and issues, provide an overall risk level assessment for the financial record (Low, Medium, or High).

  Think like a professional auditor. Your analysis must be plausible and directly related to the data you are given. Ensure that the output is well-structured and strictly follows the required JSON schema.
  `,
});

const analyzeFinancialRecordFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialRecordFlow',
    inputSchema: AnalyzeFinancialRecordInputSchema,
    outputSchema: AnalyzeFinancialRecordOutputSchema,
    retries: {
      maxAttempts: 3,
      backoff: {
        duration: '2s',
        multiplier: 2,
      },
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
