
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, AlertTriangle, CheckCircle, Clock, ShieldCheck, ListChecks, FileWarning } from "lucide-react";
import type { AutomatedComplianceChecksOutput } from "@/ai/flows/automated-compliance-checks";

export default async function RecordAnalysisPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: record, error } = await supabase
    .from("financial_records")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !record) {
    notFound();
  }

  const analysisResults = record.analysis_results as AutomatedComplianceChecksOutput | null;

  const getRiskColor = (riskLevel: "low" | "medium" | "high" | null) => {
    if (!riskLevel) return "gray";
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'processing': return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />;
        case 'failed': return <FileWarning className="h-5 w-5 text-red-600" />;
        default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Analysis Results</h1>
        <p className="text-muted-foreground">
          Detailed compliance and risk analysis for <span className="font-medium">{record.file_name}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">File Details</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Type:</span> {record.file_type}</p>
              <p><span className="font-medium">Size:</span> {(record.file_size / 1024 / 1024).toFixed(2)} MB</p>
              <p><span className="font-medium">Uploaded:</span> {format(new Date(record.created_at), 'PPP p')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
             {getStatusIcon(record.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{record.status}</div>
            <p className="text-xs text-muted-foreground">AI compliance check</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {record.risk_level ? (
              <div className={`text-2xl font-bold capitalize text-${getRiskColor(record.risk_level)}`}>
                 <Badge variant={record.risk_level === 'high' ? 'destructive' : record.risk_level === 'medium' ? 'secondary' : 'default'} className="text-2xl">
                    {record.risk_level}
                </Badge>
              </div>
            ) : (
              <div className="text-2xl font-bold">Not Analyzed</div>
            )}
            <p className="text-xs text-muted-foreground">Based on automated checks</p>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck /> Compliance Summary
          </CardTitle>
          <CardDescription>
            A high-level summary of the findings from the automated analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {record.status === 'processing' && <p className="text-muted-foreground">Analysis is in progress...</p>}
          {record.status === 'failed' && <p className="text-destructive">Analysis failed to complete.</p>}
          {record.status === 'completed' && analysisResults ? (
            <p className="text-muted-foreground">{analysisResults.summary}</p>
          ) : record.status === 'completed' && !analysisResults ? (
             <p className="text-muted-foreground">Analysis complete, but no summary was generated.</p>
          ): null}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks /> Detailed Findings
          </CardTitle>
          <CardDescription>
            Specific compliance violations and potential risks identified in the document.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {record.status === 'processing' && <p className="text-muted-foreground">Analysis is in progress...</p>}
          {record.status === 'failed' && <p className="text-destructive">Analysis failed to complete.</p>}
           {record.status === 'completed' && analysisResults && analysisResults.complianceViolations.length > 0 ? (
                <ul className="space-y-3">
                {analysisResults.complianceViolations.map((violation, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-secondary rounded-md">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                        <p className="text-sm text-secondary-foreground">{violation}</p>
                    </li>
                ))}
                </ul>
            ) : record.status === 'completed' ? (
                <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                    <p className="mt-4 font-medium">No Violations Found</p>
                    <p className="text-sm">The document appears to be compliant based on our checks.</p>
                </div>
            ) : null}
        </CardContent>
      </Card>

    </div>
  );
}

