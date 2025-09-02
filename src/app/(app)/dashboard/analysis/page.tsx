import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Analysis Overview</h1>
        <p className="text-muted-foreground">
          Review findings, anomalies, and risk flags from your financial data.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Select a Record to Analyze</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[300px]">
          <FileSearch className="w-16 h-16" />
          <p className="mt-4">
            Please select a record from the <a href="/dashboard/records" className="text-primary hover:underline">Records page</a> to view its detailed analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
