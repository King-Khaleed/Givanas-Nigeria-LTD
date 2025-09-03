
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Organizations</h1>
        <p className="text-muted-foreground">
          Manage all organizations on the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization List</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A table of organizations will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
