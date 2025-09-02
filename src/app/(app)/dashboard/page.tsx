
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileCheck2, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let recentUploads = [];
    let fileStats = { total: 0, highRisk: 0 };
    let reportCount = 0;
    
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('organization_id').single();

        if (profile?.organization_id) {
            const { data: uploads } = await supabase
                .from('financial_records')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false })
                .limit(3);
            recentUploads = uploads ?? [];

            const { count: totalCount } = await supabase
                .from('financial_records')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', profile.organization_id);
            
            const { count: highRiskCount } = await supabase
                .from('financial_records')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', profile.organization_id)
                .eq('risk_level', 'high');
                
            fileStats.total = totalCount ?? 0;
            fileStats.highRisk = highRiskCount ?? 0;

            const { count: reports } = await supabase
                .from('audit_reports')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', profile.organization_id);
            reportCount = reports ?? 0;
        }
    }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome Back!</h1>
            <p className="text-muted-foreground">Here&apos;s a summary of your financial audit activities.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
                    <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{fileStats.total}</div>
                    <p className="text-xs text-muted-foreground">Total files uploaded</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High-Risk Flags</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{fileStats.highRisk}</div>
                    <p className="text-xs text-muted-foreground">Identified in your documents</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{reportCount}</div>
                    <p className="text-xs text-muted-foreground">Total reports created</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Records</CardTitle>
                    <CardDescription>Drag and drop files or browse to upload for analysis.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg min-h-[200px] text-center">
                     <Link href="/dashboard/upload" className="flex flex-col items-center w-full">
                        <UploadCloud className="w-10 h-10 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Supported formats: PDF, Excel, CSV</p>
                        <Button asChild variant="link" className="mt-4">
                            <span>Browse Files</span>
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                    <CardDescription>Status of your most recent file uploads.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Risk</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUploads.map((upload) => (
                                <TableRow key={upload.id}>
                                    <TableCell className="font-medium">{upload.file_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={upload.status === 'completed' ? 'default' : 'secondary'}>{upload.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={upload.risk_level === 'high' ? 'destructive' : 'outline'}>{upload.risk_level ?? 'N/A'}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Your latest generated audit reports.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/dashboard/reports/new">Generate New Report</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Your recently generated reports will appear here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
