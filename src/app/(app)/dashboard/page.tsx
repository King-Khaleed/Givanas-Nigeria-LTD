
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  FileText,
  Activity,
  Download,
  Eye,
  Share2,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: records } = await supabase.from('financial_records').select('*').limit(5).order('created_at', { ascending: false });
    const { data: reports } = await supabase.from('audit_reports').select('*').limit(5).order('created_at', { ascending: false });
    const { data: activities } = await supabase.from('activities').select('*, profile:profiles(full_name, avatar_url)').limit(5).order('created_at', { ascending: false });

    const { count: filesProcessed } = await supabase.from('financial_records').select('*', { count: 'exact', head: true });
    const { count: highRiskItems } = await supabase.from('financial_records').select('*', { count: 'exact', head: true }).eq('risk_level', 'high');
    const { count: reportsGenerated } = await supabase.from('audit_reports').select('*', { count: 'exact', head: true });


  const getRiskBadge = (risk: "low" | "medium" | "high" | null) => {
    switch (risk) {
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "high":
        return <Badge variant="destructive">High</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Stable, SSR-safe date (force UTC so server/client match)
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      {/* Section 1: Welcome */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <h1 className="text-2xl font-bold">Good morning, {user?.user_metadata.full_name ?? 'Staff'}!</h1>
        <p className="text-sm opacity-80">
          Here&apos;s what&apos;s happening with your financial records today, {todayStr}.
        </p>
      </div>

      {/* Section 2: Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
                <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <FileCheck2 className="h-5 w-5 text-muted-foreground text-green-500" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{filesProcessed ?? 0}</div>
            <Progress value={75} className="h-2 mt-2" />
            </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
                <CardTitle className="text-sm font-medium">High-Risk Items</CardTitle>
                <p className="text-xs text-muted-foreground">Requires attention</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-muted-foreground text-red-500" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{highRiskItems ?? 0}</div>
            </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
                <p className="text-xs text-muted-foreground">Ready for download</p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground text-blue-500" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{reportsGenerated ?? 0}</div>
            <p className="text-xs text-green-600 mt-2">+3 this week</p>
            </CardContent>
        </Card>
      </div>

      {/* Section 3: Main Action Area */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" /> Upload Financial Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/upload">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Drag and drop your files here</p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
                <p className="text-xs text-muted-foreground mt-2">PDF, Excel, CSV, Images - Max 50MB each</p>
                </div>
            </Link>
            <Button asChild className="w-full mt-4"><Link href="/dashboard/upload">Browse Files</Link></Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Analysis Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="relative h-32 w-32">
              <svg
                className="h-full w-full"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-current text-gray-200 dark:text-gray-700"
                  strokeWidth="2"
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-current text-primary"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                75%
              </div>
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span>3 files in queue</span> <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="flex justify-between">
                <span>2 files completed</span> <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between">
                <span>0 files failed</span> <XCircle className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/analysis">View All Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>Recent Analysis</CardTitle>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/records">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.file_name}</TableCell>
                    <TableCell>{getRiskBadge(item.risk_level)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/dashboard/records/${item.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>Recent Reports</CardTitle>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/reports">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/dashboard/reports/${item.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities?.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={item.profile?.avatar_url || ""} />
                  <AvatarFallback>{item.profile?.full_name?.charAt(0) ?? 'S'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="text-sm">
                    <span className="font-semibold">{item.profile?.full_name ?? 'System'}</span>
                    {` ${item.action}`}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Load More
          </Button>
        </CardContent>
      </Card>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3">
        <Button asChild size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <Link href="/dashboard/upload">
            <UploadCloud className="h-6 w-6" />
            <span className="sr-only">Upload Files</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg">
          <Link href="/dashboard/reports/new">
            <FileText className="h-5 w-5" />
            <span className="sr-only">Generate Report</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
