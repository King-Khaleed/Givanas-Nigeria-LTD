import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const recentActivities = [
    { user: "Alice", action: "Uploaded 5 files", time: "2m ago", org: "Innovate Inc." },
    { user: "Bob", action: "Generated a report", time: "15m ago", org: "Tech Solutions" },
    { user: "Charlie", action: "Signed up", time: "1h ago", org: "New Ventures" },
    { user: "Alice", action: "Resolved 2 high-risk flags", time: "3h ago", org: "Innovate Inc." },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the AuditWise platform.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">235</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,521</div>
            <p className="text-xs text-muted-foreground">+500 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Optimal</div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>A log of recent user activities across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivities.map((activity, index) => (
                         <TableRow key={index}>
                            <TableCell className="font-medium">{activity.user}</TableCell>
                            <TableCell>{activity.org}</TableCell>
                            <TableCell>{activity.action}</TableCell>
                            <TableCell className="text-right">{activity.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
