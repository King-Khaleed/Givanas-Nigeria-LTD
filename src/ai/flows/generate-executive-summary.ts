'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating an executive summary report.
 *
 * - generateExecutiveSummary - A function that initiates the executive summary generation process.
 * - GenerateExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - GenerateExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  organizationName: z.string().describe('The name of the organization for which to generate the summary.'),
  keyMetrics: z.string().describe('Key financial metrics to include in the summary.'),
  topRiskAreas: z.string().describe('Top risk areas to highlight in the summary.'),
});
export type GenerateExecutiveSummaryInput = z.infer<typeof GenerateExecutiveSummaryInputSchema>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated executive summary report.'),
  financialHealthScore: z.number().describe('Overall financial health score for the organization.'),
});
export type GenerateExecutiveSummaryOutput = z.infer<typeof GenerateExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(input: GenerateExecutiveSummaryInput): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an AI assistant specialized in generating executive summaries for financial audit reports.

  Based on the provided information about the organization, key metrics, and top risk areas, generate a concise and informative executive summary report.
  Also, determine an overall financial health score for the organization based on the inputs.

  Organization Name: {{{organizationName}}}
  Key Metrics: {{{keyMetrics}}}
  Top Risk Areas: {{{topRiskAreas}}}

  Executive Summary: `,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
