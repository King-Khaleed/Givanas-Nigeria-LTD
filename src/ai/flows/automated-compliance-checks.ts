'use server';

/**
 * @fileOverview An automated compliance checker for financial documents.
 *
 * - automatedComplianceChecks - A function that handles the compliance checking process.
 * - AutomatedComplianceChecksInput - The input type for the automatedComplianceChecks function.
 * - AutomatedComplianceChecksOutput - The return type for the automatedComplianceChecks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AutomatedComplianceChecksInputSchema = z.object({
  financialDocumentDataUri: z
    .string()
    .describe(
      "A financial document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutomatedComplianceChecksInput = z.infer<typeof AutomatedComplianceChecksInputSchema>;

const AutomatedComplianceChecksOutputSchema = z.object({
  complianceViolations: z
    .array(z.string())
    .describe('A list of compliance violations found in the document.'),
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The overall risk level associated with the document.'),
  summary: z.string().describe('A summary of the compliance check results.'),
});
export type AutomatedComplianceChecksOutput = z.infer<typeof AutomatedComplianceChecksOutputSchema>;

export async function automatedComplianceChecks(
  input: AutomatedComplianceChecksInput
): Promise<AutomatedComplianceChecksOutput> {
  return automatedComplianceChecksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedComplianceChecksPrompt',
  input: {schema: AutomatedComplianceChecksInputSchema},
  output: {schema: AutomatedComplianceChecksOutputSchema},
  prompt: `You are an expert financial compliance analyst.

You will analyze the provided financial document and identify any compliance violations.

You will provide a list of compliance violations, an overall risk level (low, medium, or high), and a summary of your findings.

Document:
{{media url=financialDocumentDataUri}}
`,
});

const automatedComplianceChecksFlow = ai.defineFlow(
  {
    name: 'automatedComplianceChecksFlow',
    inputSchema: AutomatedComplianceChecksInputSchema,
    outputSchema: AutomatedComplianceChecksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
