
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Loader2, Sparkles, FileText, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { generateExecutiveSummary, type GenerateExecutiveSummaryOutput } from '@/ai/flows/generate-executive-summary';
import { generateDetailedAnalysis, type GenerateDetailedAnalysisOutput } from '@/ai/flows/generate-detailed-analysis';
import { generateRiskAssessment, type GenerateRiskAssessmentOutput } from '@/ai/flows/generate-risk-assessment';
import { generateComplianceReport, type GenerateComplianceReportOutput } from '@/ai/flows/generate-compliance-report';
import { saveReport } from '@/lib/actions/reports';
import { useAuth } from '@/context/AuthProvider';

import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

type ReportResult = 
    | { type: 'summary', data: GenerateExecutiveSummaryOutput }
    | { type: 'detailed', data: GenerateDetailedAnalysisOutput }
    | { type: 'risk', data: GenerateRiskAssessmentOutput }
    | { type: 'compliance', data: GenerateComplianceReportOutput };

const formSchema = z.object({
  reportTitle: z.string().min(1, 'Report title is required.'),
  reportType: z.enum(['summary', 'detailed', 'risk', 'compliance'], {
    required_error: 'You need to select a report type.',
  }),
  recordIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one record.",
  }),
});

interface ReportGeneratorProps {
    organizationName: string;
    availableRecords: { id: string; name: string; }[];
    userRole: 'staff' | 'client' | 'admin';
}

const ReportResultViewer = ({ result, title, onGenerateNew }: { result: ReportResult, title: string, onGenerateNew: () => void }) => {

    const formatReportForDownload = (): string => {
        let content = `Report Title: ${title}\n`;
        content += `Generated On: ${new Date().toLocaleDateString()}\n`;
        content += "========================================\n\n";

        switch (result.type) {
            case 'summary':
                content += `Overall Financial Health Score: ${result.data.financialHealthScore}/100\n\n`;
                content += `Executive Summary:\n${result.data.summary}`;
                break;
            case 'detailed':
                content += `${result.data.introduction}\n\n`;
                content += `Transaction Analysis:\n${result.data.transactionAnalysis.summary}\n`;
                content += `Outliers:\n` + result.data.transactionAnalysis.outliers.map(o => `  - ${o.amount}: ${o.description}`).join('\n') + '\n\n';
                content += `Balance Sheet Analysis:\n${result.data.balanceSheetAnalysis.summary}\n`;
                content += `Key Observations:\n` + result.data.balanceSheetAnalysis.keyObservations.map(o => `  - ${o}`).join('\n') + '\n\n';
                content += `Conclusion:\n${result.data.finalConclusion}`;
                break;
            case 'risk':
                content += `Overall Risk Score: ${result.data.overallRiskScore}/100\n\n`;
                content += `Risk Summary:\n${result.data.riskSummary}\n\n`;
                content += `Identified Risks:\n`;
                result.data.identifiedRisks.forEach(risk => {
                    content += `  - Category: ${risk.category}\n`;
                    content += `    Severity: ${risk.severity}\n`;
                    content += `    Description: ${risk.description}\n`;
                    content += `    Mitigation: ${risk.mitigation}\n\n`;
                });
                break;
            case 'compliance':
                 content += `Overall Compliance Status: ${result.data.complianceStatus}\n\n`;
                 content += `Executive Summary:\n${result.data.executiveSummary}\n\n`;
                 content += `Compliance Findings:\n`;
                 result.data.findings.forEach(finding => {
                     content += `  - Area: ${finding.area}\n`;
                     content += `    Status: ${finding.status}\n`;
                     content += `    Finding: ${finding.description}\n`;
                     content += `    Recommendation: ${finding.recommendation}\n\n`;
                 });
                 break;
        }
        return content;
    }

    const handleDownload = () => {
        const reportContent = formatReportForDownload();
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/ /g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {result.type === 'summary' && (
                    <>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Overall Financial Health Score</h3>
                            <div className='flex items-center gap-4'>
                                <span className="text-4xl font-bold">{result.data.financialHealthScore}/100</span>
                                <Progress value={result.data.financialHealthScore} className="w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Executive Summary</h3>
                            <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {result.data.summary}
                            </div>
                        </div>
                    </>
                )}
                 {result.type === 'detailed' && (
                    <div className="space-y-4">
                        <p>{result.data.introduction}</p>
                        <div>
                            <h3 className="font-semibold text-lg">Transaction Analysis</h3>
                            <p className="text-sm text-muted-foreground">{result.data.transactionAnalysis.summary}</p>
                            <h4 className="font-medium mt-2">Outliers:</h4>
                             <ul className="list-disc pl-5 space-y-1">
                                {result.data.transactionAnalysis.outliers.map(o => <li key={o.transactionId}>{o.amount}: {o.description}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg">Balance Sheet Analysis</h3>
                             <p className="text-sm text-muted-foreground">{result.data.balanceSheetAnalysis.summary}</p>
                             <h4 className="font-medium mt-2">Key Observations:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                {result.data.balanceSheetAnalysis.keyObservations.map((o, i) => <li key={i}>{o}</li>)}
                            </ul>
                        </div>
                        <div>
                             <h3 className="font-semibold text-lg">Conclusion</h3>
                             <p className="text-sm">{result.data.finalConclusion}</p>
                        </div>
                    </div>
                )}
                {result.type === 'risk' && (
                     <>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Overall Risk Score</h3>
                             <div className='flex items-center gap-4'>
                                <span className="text-4xl font-bold text-destructive">{result.data.overallRiskScore}/100</span>
                                <Progress value={result.data.overallRiskScore} className="w-1/2" indicatorClassName="bg-destructive" />
                            </div>
                             <p className="text-sm text-muted-foreground">{result.data.riskSummary}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Identified Risks</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Mitigation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.data.identifiedRisks.map(risk => (
                                        <TableRow key={risk.riskId}>
                                            <TableCell>{risk.category}</TableCell>
                                            <TableCell>{risk.description}</TableCell>
                                            <TableCell><Badge variant={risk.severity === 'Critical' || risk.severity === 'High' ? 'destructive' : 'secondary'}>{risk.severity}</Badge></TableCell>
                                            <TableCell>{risk.mitigation}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
                 {result.type === 'compliance' && (
                     <>
                        <div className="space-y-2">
                             <h3 className="font-semibold">Overall Compliance Status</h3>
                             <div className='flex items-center gap-2'>
                                {result.data.complianceStatus === 'Compliant' ? <ShieldCheck className="w-8 h-8 text-green-600" /> : <AlertTriangle className="w-8 h-8 text-destructive" />}
                                <span className="text-2xl font-bold">{result.data.complianceStatus}</span>
                            </div>
                             <p className="text-sm text-muted-foreground">{result.data.executiveSummary}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Compliance Findings</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Area</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Finding</TableHead>
                                        <TableHead>Recommendation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.data.findings.map((finding, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{finding.area}</TableCell>
                                            <TableCell><Badge variant={finding.status === 'Compliant' ? 'default' : 'destructive'} className={finding.status === 'Compliant' ? 'bg-green-600' : ''}>{finding.status}</Badge></TableCell>
                                            <TableCell>{finding.description}</TableCell>
                                            <TableCell>{finding.recommendation}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className="gap-4">
                <Button onClick={onGenerateNew}>
                    <FileText /> Generate New Report
                </Button>
                <Button variant="outline" onClick={handleDownload}><Download /> Download Report</Button>
            </CardFooter>
        </Card>
    );
}


export function ReportGenerator({ organizationName, availableRecords, userRole }: ReportGeneratorProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const { user, profile } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportTitle: `Executive Summary - ${organizationName}`,
      reportType: 'summary',
      recordIds: availableRecords.map(r => r.id), // Select all by default
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setResult(null);
    
    if (!user || !profile?.organization_id) {
        setError("You must be logged in to an organization to generate a report.");
        return;
    }

    const selectedRecords = availableRecords.filter(r => values.recordIds.includes(r.id));
    const recordsData = JSON.stringify(selectedRecords); // Pass record names for now
    
    startTransition(async () => {
      try {
        let aiResult: ReportResult | null = null;
        switch(values.reportType) {
            case 'summary':
                const summaryResult = await generateExecutiveSummary({
                    organizationName,
                    keyMetrics: recordsData, // Use stringified data
                    topRiskAreas: 'Duplicate payments, Non-compliant expenses, Unusual transaction times'
                });
                aiResult = { type: 'summary', data: summaryResult };
                break;
            case 'detailed':
                const detailedResult = await generateDetailedAnalysis({ organizationName, recordsData });
                aiResult = { type: 'detailed', data: detailedResult };
                break;
            case 'risk':
                 const riskResult = await generateRiskAssessment({ organizationName, recordsData });
                aiResult = { type: 'risk', data: riskResult };
                break;
            case 'compliance':
                 const complianceResult = await generateComplianceReport({ organizationName, recordsData, complianceFramework: 'GAAP' });
                aiResult = { type: 'compliance', data: complianceResult };
                break;
        }

        if (aiResult) {
            // Save the report to the database
            await saveReport({
                title: values.reportTitle,
                reportType: values.reportType,
                reportData: aiResult.data,
                organizationId: profile.organization_id,
                userId: user.id,
            });

            setResult(aiResult);
            setStep(2);
        } else {
             setError('Selected report type is not yet implemented.');
        }
      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
      }
    });
  }
  
  const handleGenerateNew = () => {
    setStep(1);
    setResult(null);
    setError(null);
    form.reset({
      reportTitle: `Executive Summary - ${organizationName}`,
      reportType: 'summary',
      recordIds: availableRecords.map(r => r.id),
    });
  }

  if (step === 2 && result) {
    return (
        <ReportResultViewer result={result} title={form.getValues('reportTitle')} onGenerateNew={handleGenerateNew} />
    )
  }

  // Client role sees a "coming soon" or "no reports" message instead of the generator
  if (userRole === 'client') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            View and download reports generated by your organization's staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-8 border-2 border-dashed rounded-lg text-center h-64 flex flex-col justify-center items-center">
                <h2 className="text-xl font-semibold">No Reports Available</h2>
                <p className="text-muted-foreground">Once reports are generated for you, they will appear here.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Step 1: Configure Report</CardTitle>
        <CardDescription>
          Select the parameters for your new audit report.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="reportTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Report Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="summary" />
                        </FormControl>
                        <FormLabel className="font-normal">Summary</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="detailed" />
                        </FormControl>
                        <FormLabel className="font-normal">Detailed Analysis</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="risk" />
                        </FormControl>
                        <FormLabel className="font-normal">Risk Assessment</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="compliance" />
                        </FormControl>
                        <FormLabel className="font-normal">Compliance</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recordIds"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Select Records</FormLabel>
                    <FormDescription>
                      Choose the financial records to include in this report.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                  {availableRecords.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="recordIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
