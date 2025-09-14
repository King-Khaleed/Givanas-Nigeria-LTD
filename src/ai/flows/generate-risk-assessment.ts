'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a risk assessment report.
 *
 * - generateRiskAssessment - A function that initiates the risk assessment generation process.
 * - GenerateRiskAssessmentInput - The input type for the generateRiskAssessment function.
 * - GenerateRiskAssessmentOutput - The return type for the generateRiskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRiskAssessmentInputSchema = z.object({
  organizationName: z.string().describe('The name of the organization.'),
  recordsData: z.string().describe('A stringified array of financial record data to be assessed for risk.'),
});
export type GenerateRiskAssessmentInput = z.infer<typeof GenerateRiskAssessmentInputSchema>;

const GenerateRiskAssessmentOutputSchema = z.object({
  reportTitle: z.string().describe('The title of the risk assessment report.'),
  overallRiskScore: z.number().min(0).max(100).describe('A score from 0-100 indicating the overall financial risk.'),
  riskSummary: z.string().describe('A summary of the key risks identified.'),
  identifiedRisks: z.array(z.object({
    riskId: z.string().describe('A unique identifier for the risk.'),
    category: z.string().describe('The category of the risk (e.g., Operational, Financial, Compliance).'),
    description: z.string().describe('A detailed description of the identified risk.'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity of the risk.'),
    mitigation: z.string().describe('A suggested mitigation strategy for the risk.'),
  })),
});
export type GenerateRiskAssessmentOutput = z.infer<typeof GenerateRiskAssessmentOutputSchema>;

export async function generateRiskAssessment(input: GenerateRiskAssessmentInput): Promise<GenerateRiskAssessmentOutput> {
  return generateRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRiskAssessmentPrompt',
  input: {schema: GenerateRiskAssessmentInputSchema},
  output: {schema: GenerateRiskAssessmentOutputSchema},
  prompt: `You are an AI risk analyst for {{{organizationName}}}. Your goal is to identify and assess financial risks from the provided data.

Financial Data:
{{{recordsData}}}

Based on this data, please conduct a risk assessment. Identify at least 3-5 potential risks, categorizing each one, describing it, assessing its severity, and providing a mitigation strategy. Calculate an overall risk score between 0 and 100, where 100 is the highest risk. Provide a summary of your findings.
`,
});

const generateRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'generateRiskAssessmentFlow',
    inputSchema: GenerateRiskAssessmentInputSchema,
    outputSchema: GenerateRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
