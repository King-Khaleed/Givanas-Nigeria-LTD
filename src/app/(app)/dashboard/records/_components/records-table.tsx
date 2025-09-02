
'use client'

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import Link from "next/link";
import { getDownloadUrl } from "@/app/actions/records";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FinancialRecord } from "@/lib/types";

export function RecordsTable({ records, pageCount }: { records: FinancialRecord[], pageCount: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentPage = Number(searchParams.get('page')) || 1;

    const handlePagination = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.replace(`${pathname}?${params.toString()}`);
    }

  return (
    <div className="w-full">
        <div className="rounded-md border">
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
                                <Badge variant={record.risk_level === 'high' ? 'destructive' : record.risk_level === 'medium' ? 'secondary' : 'outline'}>{record.risk_level ?? 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="flex gap-2">
                                 <Button asChild variant="ghost" size="icon">
                                    <Link href={`/dashboard/records/${record.id}`}>
                                        <FileSearch className="h-4 w-4" />
                                    </Link>
                                </Button>
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
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePagination(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">Page {currentPage} of {pageCount}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePagination(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              Next
            </Button>
        </div>
    </div>
  );
}
