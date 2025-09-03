
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
import { MoreHorizontal, Eye, Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Finding = {
  id: string;
  riskLevel: 'high' | 'medium' | 'low';
  findingType: string;
  fileName: string;
  description: string;
  dateFound: string;
  status: 'new' | 'under_review' | 'resolved' | 'ignored';
}

const RiskBadge = ({ riskLevel }: { riskLevel: Finding['riskLevel'] }) => {
    const variant = {
        high: 'destructive',
        medium: 'secondary',
        low: 'default'
    }[riskLevel] as "default" | "secondary" | "destructive";

     const colors = {
        high: 'bg-red-100 text-red-800 border-red-200',
        medium: 'bg-orange-100 text-orange-800 border-orange-200',
        low: 'bg-green-100 text-green-800 border-green-200'
    }[riskLevel];

    return <Badge variant={variant} className={`capitalize ${colors}`}>{riskLevel}</Badge>
}

const StatusBadge = ({ status }: { status: Finding['status'] }) => {
     const colors = {
        new: 'bg-blue-100 text-blue-800',
        under_review: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        ignored: 'bg-gray-100 text-gray-800'
    }[status];
    return <Badge className={`capitalize ${colors}`}>{status.replace('_', ' ')}</Badge>
}


export function FindingsTable({ findings }: { findings: Finding[] }) {

  return (
    <div className="w-full">
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead padding="checkbox">
                            <Checkbox />
                        </TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Finding Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date Found</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {findings.map((finding) => (
                        <TableRow key={finding.id}>
                            <TableCell padding="checkbox">
                                <Checkbox />
                            </TableCell>
                            <TableCell><RiskBadge riskLevel={finding.riskLevel} /></TableCell>
                            <TableCell>{finding.findingType}</TableCell>
                            <TableCell className="font-medium">{finding.fileName}</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">{finding.description}</TableCell>
                            <TableCell>{format(new Date(finding.dateFound), 'PPP')}</TableCell>
                            <TableCell><StatusBadge status={finding.status} /></TableCell>
                            <TableCell>
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Check className="mr-2 h-4 w-4" /> Mark as Reviewed
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <MessageSquare className="mr-2 h-4 w-4" /> Add Note
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <X className="mr-2 h-4 w-4" /> Ignore
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
        </div>
    </div>
  );
}

