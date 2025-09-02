import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Report Generator</h1>
        <p className="text-muted-foreground">
          Create and customize comprehensive audit reports.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate a New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The report generation wizard will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
