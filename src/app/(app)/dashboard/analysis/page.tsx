import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Analysis Results</h1>
        <p className="text-muted-foreground">
          Review findings, anomalies, and risk flags from your financial data.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analysis results will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
