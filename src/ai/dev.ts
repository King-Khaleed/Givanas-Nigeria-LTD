import { config } from 'dotenv';
config();

import '@/ai/flows/automated-anomaly-detection.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/generate-detailed-analysis.ts';
import '@/ai/flows/generate-risk-assessment.ts';
import '@/ai/flows/generate-compliance-report.ts';
