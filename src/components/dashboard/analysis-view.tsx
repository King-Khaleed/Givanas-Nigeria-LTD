
'use client';

import { type AnalyzeFinancialRecordOutput } from '@/ai/flows/automated-anomaly-detection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, BarChart, Bell, CheckCircle2, FileWarning, MoreHorizontal, ShieldCheck, Loader2, Info } from 'lucide-react';
import StatCard from '../shared/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge as UiBadge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateRiskFlagStatus } from '@/lib/actions/analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type Anomaly = AnalyzeFinancialRecordOutput['analysisResults']['anomalies'][number] & {
  id: string; // Add a unique ID for each flag
  date: string;
  status: 'New' | 'Reviewed' | 'Resolved';
};
type ComplianceIssue = AnalyzeFinancialRecordOutput['analysisResults']['complianceIssues'][number] & {
  id: string; // Add a unique ID for each flag
  date: string;
  status: 'New' | 'Reviewed' | 'Resolved';
};

type RiskFlag = (Anomaly | ComplianceIssue) & { 
  flagType: 'Anomaly' | 'Compliance';
  recordId: string; // Add recordId to know which record to update
};

interface AnalysisViewProps {
  results: (AnalyzeFinancialRecordOutput['analysisResults'] & { recordId: string })[];
  userRole: 'staff' | 'client' | 'admin';
}

const getSeverityUi = (severity: 'Low' | 'Medium' | 'High') => {
  switch (severity) {
    case 'High':
      return {
        badge: <UiBadge variant="destructive">High</UiBadge>,
        icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
      };
    case 'Medium':
      return {
        badge: <UiBadge variant="secondary" className="bg-orange-400 text-white hover:bg-orange-500">Medium</UiBadge>,
        icon: <FileWarning className="w-5 h-5 text-orange-400" />,
      };
    case 'Low':
      return {
        badge: <UiBadge variant="outline">Low</UiBadge>,
        icon: <Bell className="w-5 h-5 text-muted-foreground" />,
      };
  }
};

const getStatusBadge = (status: RiskFlag['status']) => {
    switch(status) {
        case 'New':
            return <UiBadge variant="secondary">New</UiBadge>;
        case 'Reviewed':
            return <UiBadge variant="outline">Reviewed</UiBadge>;
        case 'Resolved':
            return <UiBadge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Resolved</UiBadge>
    }
}

export function AnalysisView({ results, userRole }: AnalysisViewProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (recordId: string, flagId: string, newStatus: 'Reviewed' | 'Resolved') => {
    startTransition(async () => {
      const result = await updateRiskFlagStatus(recordId, flagId, newStatus);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error updating status',
          description: result.error,
        });
      } else {
        toast({
          title: 'Status Updated',
          description: `Flag status has been changed to ${newStatus}.`,
        });
      }
    });
  };

  const riskFlags: RiskFlag[] = results.flatMap((r) => [
    ...r.anomalies.map((a, i) => {
      const id = `${r.recordId}-anomaly-${i}`;
      return {
      ...a,
      id,
      recordId: r.recordId,
      date: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
      status: (a as any).status || 'New', // Use existing status or default to New
      flagType: 'Anomaly' as const,
    }}),
    ...r.complianceIssues.map((c, i) => {
      const id = `${r.recordId}-compliance-${i}`;
      return {
      ...c,
      id,
      recordId: r.recordId,
      date: new Date(Date.now() - (i + r.anomalies.length) * 1000 * 60 * 60 * 24).toISOString(),
      status: (c as any).status || 'New', // Use existing status or default to New
      flagType: 'Compliance' as const,
    }}),
  ]);

  const totalAnomalies = results.reduce((sum, r) => sum + r.anomalies.length, 0);
  const highRiskFlagsCount = riskFlags.filter((f) => f.severity === 'High').length;
  const overallHealthScore =
    results.length > 0
      ? ((results.filter((r) => r.overallRiskLevel === 'Low').length / results.length) * 100).toFixed(0)
      : 100;
  const totalTransactions = 1843; // Mock data

  const isPlaceholderResult = results.length === 1 && results[0].summary.includes('was not analyzed by AI');

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Health Score"
          value={`${overallHealthScore}%`}
          icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
          description="Based on recent analyses"
          valueClassName={parseInt(overallHealthScore as string) > 80 ? 'text-green-600' : 'text-yellow-600'}
        />
        <StatCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          description="Across all records"
        />
        <StatCard
          title="Anomalies Detected"
          value={totalAnomalies.toString()}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          description="Potential irregularities"
        />
        <StatCard
          title="High-Risk Flags"
          value={highRiskFlagsCount.toString()}
          icon={<FileWarning className="h-4 w-4 text-muted-foreground" />}
          description="Requiring immediate attention"
          valueClassName="text-destructive"
        />
      </div>

       {isPlaceholderResult && (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Informational Notice</AlertTitle>
            <AlertDescription>
                The analysis for this file type (e.g., Excel, CSV) is a placeholder. The record has been marked as 'completed' and given a default 'Low' risk score because the AI model cannot natively process its content. No automated anomaly detection was performed.
            </AlertDescription>
        </Alert>
       )}

      <Card>
        <CardHeader>
          <CardTitle>Risk Flags</CardTitle>
          <CardDescription>
            Detailed list of all detected risks, anomalies, and compliance issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date Detected</TableHead>
                <TableHead>Status</TableHead>
                {userRole === 'staff' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskFlags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityUi(flag.severity).icon}
                      <span className="font-medium">{flag.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{flag.description}</p>
                    <p className="text-xs text-muted-foreground">
                        {'recordReference' in flag ? flag.recordReference : 'General'}
                    </p>
                  </TableCell>
                  <TableCell>{getSeverityUi(flag.severity).badge}</TableCell>
                  <TableCell>{new Date(flag.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(flag.status)}</TableCell>
                  {userRole === 'staff' && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                            <span className="sr-only">Open menu</span>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>View Details</DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(flag.recordId, flag.id, 'Reviewed')}
                            disabled={flag.status === 'Reviewed' || flag.status === 'Resolved'}
                          >
                            Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                             onClick={() => handleStatusChange(flag.recordId, flag.id, 'Resolved')}
                             disabled={flag.status === 'Resolved'}
                          >
                            Mark as Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
               {riskFlags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={userRole === 'staff' ? 6 : 5} className="h-24 text-center">
                    No risk flags found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
