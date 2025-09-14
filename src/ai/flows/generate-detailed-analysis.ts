'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a detailed financial analysis report.
 *
 * - generateDetailedAnalysis - A function that initiates the detailed analysis generation process.
 * - GenerateDetailedAnalysisInput - The input type for the generateDetailedAnalysis function.
 * - GenerateDetailedAnalysisOutput - The return type for the generateDetailedAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetailedAnalysisInputSchema = z.object({
  organizationName: z.string().describe('The name of the organization for which to generate the analysis.'),
  recordsData: z.string().describe('A stringified array of financial record data to be analyzed in detail.'),
});
export type GenerateDetailedAnalysisInput = z.infer<typeof GenerateDetailedAnalysisInputSchema>;

const GenerateDetailedAnalysisOutputSchema = z.object({
  reportTitle: z.string().describe('The title of the detailed analysis report.'),
  introduction: z.string().describe('An introduction to the detailed analysis performed.'),
  transactionAnalysis: z.object({
    summary: z.string().describe('A summary of the transaction analysis.'),
    outliers: z.array(z.object({
        transactionId: z.string().describe('The ID of the outlier transaction.'),
        description: z.string().describe('Why this transaction is considered an outlier.'),
        amount: z.string().describe('The amount of the transaction.'),
    })),
  }),
  balanceSheetAnalysis: z.object({
    summary: z.string().describe('A summary of the balance sheet analysis.'),
    keyObservations: z.array(z.string()).describe('Key observations from the balance sheet.'),
  }),
  finalConclusion: z.string().describe('The final conclusion of the detailed analysis.'),
});
export type GenerateDetailedAnalysisOutput = z.infer<typeof GenerateDetailedAnalysisOutputSchema>;

export async function generateDetailedAnalysis(input: GenerateDetailedAnalysisInput): Promise<GenerateDetailedAnalysisOutput> {
  return generateDetailedAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedAnalysisPrompt',
  input: {schema: GenerateDetailedAnalysisInputSchema},
  output: {schema: GenerateDetailedAnalysisOutputSchema},
  prompt: `You are an AI financial analyst for {{{organizationName}}}. Your task is to conduct a detailed analysis of the provided financial records.

Records Data:
{{{recordsData}}}

Based on this data, please perform a deep dive. Analyze transactions to find outliers or notable patterns. Review balance sheet items for significant changes or concerns. Structure your output into an introduction, transaction analysis, balance sheet analysis, and a final conclusion. Be thorough and provide specific examples.
`,
});

const generateDetailedAnalysisFlow = ai.defineFlow(
  {
    name: 'generateDetailedAnalysisFlow',
    inputSchema: GenerateDetailedAnalysisInputSchema,
    outputSchema: GenerateDetailedAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
