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
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecordsPage() {
    const records = [
        { name: "Q1_report.pdf", type: "PDF", size: "2.3 MB", date: "2024-04-10", status: "Completed", risk: "Low" },
        { name: "March_invoices.csv", type: "CSV", size: "1.1 MB", date: "2024-04-09", status: "Processing", risk: "N/A" },
        { name: "Receipt_482.jpg", type: "Image", size: "450 KB", date: "2024-04-08", status: "Completed", risk: "High" },
        { name: "Vendor_payments.xlsx", type: "Excel", size: "800 KB", date: "2024-04-05", status: "Completed", risk: "Medium" },
        { name: "Statement_Feb.pdf", type: "PDF", size: "1.5 MB", date: "2024-03-15", status: "Failed", risk: "Error" },
    ];
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
          <CardDescription>You have {records.length} records in total.</CardDescription>
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
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.name}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell>{record.type}</TableCell>
                            <TableCell>{record.size}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell><Badge>{record.status}</Badge></TableCell>
                            <TableCell><Badge variant={record.risk === 'High' ? 'destructive' : record.risk === 'Medium' ? 'secondary' : 'outline'}>{record.risk}</Badge></TableCell>
                            <TableCell>
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
