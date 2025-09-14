'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a compliance report.
 *
 * - generateComplianceReport - A function that initiates the compliance report generation process.
 * - GenerateComplianceReportInput - The input type for the generateComplianceReport function.
 * - GenerateComplianceReportOutput - The return type for the generateComplianceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComplianceReportInputSchema = z.object({
  organizationName: z.string().describe('The name of the organization.'),
  recordsData: z.string().describe('A stringified array of financial record data to be analyzed.'),
  complianceFramework: z.string().describe('The compliance framework to check against (e.g., GAAP, IFRS).'),
});
export type GenerateComplianceReportInput = z.infer<typeof GenerateComplianceReportInputSchema>;

const GenerateComplianceReportOutputSchema = z.object({
  reportTitle: z.string().describe('The title of the compliance report.'),
  executiveSummary: z.string().describe('A high-level summary of the compliance findings.'),
  complianceStatus: z.enum(['Compliant', 'Partially-Compliant', 'Non-Compliant']).describe('Overall compliance status.'),
  findings: z.array(z.object({
    area: z.string().describe('The area of compliance checked (e.g., Revenue Recognition).'),
    status: z.enum(['Compliant', 'Non-compliant', 'N/A']).describe('Status for this specific area.'),
    description: z.string().describe('Description of the finding.'),
    recommendation: z.string().describe('Recommendation to address the finding.'),
  })),
});
export type GenerateComplianceReportOutput = z.infer<typeof GenerateComplianceReportOutputSchema>;

export async function generateComplianceReport(input: GenerateComplianceReportInput): Promise<GenerateComplianceReportOutput> {
  return generateComplianceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComplianceReportPrompt',
  input: {schema: GenerateComplianceReportInputSchema},
  output: {schema: GenerateComplianceReportOutputSchema},
  prompt: `You are an AI compliance auditor for {{{organizationName}}}. Your task is to generate a compliance report based on financial data against the {{{complianceFramework}}} framework.

Analyze the following record data:
{{{recordsData}}}

Based on this data, please generate a structured compliance report. For each relevant area of the framework, provide a finding, its status, a description, and a clear recommendation for any non-compliant items. Provide an overall compliance status and an executive summary.
`,
});

const generateComplianceReportFlow = ai.defineFlow(
  {
    name: 'generateComplianceReportFlow',
    inputSchema: GenerateComplianceReportInputSchema,
    outputSchema: GenerateComplianceReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
