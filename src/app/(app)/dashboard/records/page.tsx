
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { format } from 'date-fns';
import Link from "next/link";
import { getDownloadUrl } from "@/app/actions/records";

export default async function RecordsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let records = [];
    let recordCount = 0;

    if (user) {
        const { data, count } = await supabase
            .from('financial_records')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });
        records = data ?? [];
        recordCount = count ?? 0;
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Financial Records</h1>
        <p className="text-muted-foreground">
          Manage, search, and analyze all your uploaded financial documents.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
          <CardDescription>You have {recordCount} records in total.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.file_name}</TableCell>
                            <TableCell>{record.file_type}</TableCell>
                            <TableCell>{(record.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                            <TableCell>{format(new Date(record.created_at), 'PPP')}</TableCell>
                            <TableCell><Badge variant={record.status === 'completed' ? 'default' : record.status === 'failed' ? 'destructive' : 'secondary'}>{record.status}</Badge></TableCell>
                            <TableCell>
                                {/* @ts-ignore */}
                                <Badge variant={record.risk_level === 'high' ? 'destructive' : record.risk_level === 'medium' ? 'secondary' : 'outline'}>{record.risk_level ?? 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <form action={getDownloadUrl}>
                                    <input type="hidden" name="path" value={record.file_path} />
                                    <Button type="submit" variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </form>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
