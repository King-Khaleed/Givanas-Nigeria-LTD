
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">All Reports</h1>
        <p className="text-muted-foreground">
          Review and manage all generated reports across the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Report List</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A table of all audit reports will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
