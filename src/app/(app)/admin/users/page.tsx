import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Users</h1>
        <p className="text-muted-foreground">
          Manage all users on the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A table of users will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
