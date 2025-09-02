'use server';

/**
 * @fileOverview An AI agent to generate an executive summary of financial records.
 *
 * - generateExecutiveSummary - A function that generates the executive summary.
 * - GenerateExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - GenerateExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  financialRecords: z.string().describe('Financial records in JSON format.'),
});
export type GenerateExecutiveSummaryInput = z.infer<
  typeof GenerateExecutiveSummaryInputSchema
>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  summary: z.string().describe('Executive summary of the financial records.'),
  keyMetrics: z.string().describe('Key metrics identified in the financial records.'),
  topRiskAreas: z.string().describe('Top risk areas identified in the financial records.'),
  recommendations: z
    .string()
    .describe('Recommendations based on the financial records.'),
});
export type GenerateExecutiveSummaryOutput = z.infer<
  typeof GenerateExecutiveSummaryOutputSchema
>;

export async function generateExecutiveSummary(
  input: GenerateExecutiveSummaryInput
): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an expert financial analyst. Generate an executive summary of the following financial records, identify key metrics, top risk areas, and recommendations.\n\nFinancial Records: {{{financialRecords}}}`,
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
