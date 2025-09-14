
"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, File, FileText, FileSpreadsheet, Clock, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { type Record } from "./data"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteRecordDialog } from "@/components/dashboard/delete-record-dialog"
import { useTransition } from "react"
import { runAnalysisOnRecord } from "@/lib/actions/records"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthProvider"

const getStatusBadge = (status: Record['status']) => {
    switch (status) {
        case 'completed':
            return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
        case 'analyzing':
            return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Analyzing</Badge>;
        case 'processing':
            return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Processing</Badge>;
        case 'pending':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
        case 'failed':
            return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
    }
}

const getRiskIndicator = (risk: Record['riskLevel']) => {
    switch (risk) {
        case 'High':
            return <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-destructive"></span>High</div>
        case 'Medium':
            return <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"></span>Medium</div>
        case 'Low':
            return <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span>Low</div>
        default:
            return <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-300"></span>N/A</div>
    }
}

const getFileIcon = (type: Record['fileType']) => {
    switch (type) {
        case 'PDF':
            return <FileText className="w-5 h-5 text-red-500" />
        case 'Excel':
            return <FileSpreadsheet className="w-5 h-5 text-green-600" />
        case 'CSV':
            return <File className="w-5 h-5 text-blue-500" />
        default:
            return <File className="w-5 h-5 text-gray-500" />
    }
}

const RecordActions = ({ record }: { record: Record }) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const { profile } = useAuth();

    const handleAnalyze = () => {
        if (!profile?.organization_name) {
            toast({ variant: 'destructive', title: 'Error', description: 'Organization name not found.' });
            return;
        }

        startTransition(async () => {
            const result = await runAnalysisOnRecord(record.id, profile.organization_name);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
            } else {
                toast({ title: 'Analysis Started', description: 'The record is now being analyzed.' });
            }
        });
    }

    if (profile?.role === 'client') {
        return null;
    }

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
              <span className="sr-only">Open menu</span>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {record.status === 'pending' && (
                 <DropdownMenuItem onClick={handleAnalyze}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze
                </DropdownMenuItem>
            )}
             {record.status === 'completed' && (
                <DropdownMenuItem disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Analysis Complete
                </DropdownMenuItem>
            )}
            <DropdownMenuItem>Download</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteRecordDialog recordId={record.id} recordName={record.fileName}>
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                >
                    Delete
                </DropdownMenuItem>
            </DeleteRecordDialog>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const getColumns = (role: "staff" | "client" | "admin"): ColumnDef<Record>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fileName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          File Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const record = row.original;
      return (
        <div className="flex items-center gap-3">
            {getFileIcon(record.fileType)}
            <span className="font-medium">{record.fileName}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "fileType",
    header: "File Type",
    cell: ({ row }) => row.getValue("fileType"),
  },
  {
    accessorKey: "uploadDate",
    header: "Upload Date",
    cell: ({ row }) => new Date(row.getValue("uploadDate")).toLocaleDateString(),
  },
  {
    accessorKey: "fileSize",
    header: "File Size",
    cell: ({ row }) => `${((row.getValue("fileSize") as number) / (1024*1024)).toFixed(2)} MB`
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
   {
    accessorKey: "riskLevel",
    header: "Risk Level",
    cell: ({ row }) => getRiskIndicator(row.getValue("riskLevel")),
  },
  {
    id: "actions",
    cell: ({ row }) => <RecordActions record={row.original} />,
  },
]
