import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profile settings form will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
