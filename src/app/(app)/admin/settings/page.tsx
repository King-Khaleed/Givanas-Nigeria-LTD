import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">System Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide parameters and integrations.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>System settings form will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
