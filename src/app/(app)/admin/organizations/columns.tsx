
"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

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
import { type Organization } from "./data"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteOrganizationDialog } from "@/components/admin/delete-organization-dialog"
import { EditOrganizationDialog } from "@/components/admin/edit-organization-dialog"

export const getColumns = (users: { id: string; full_name: string | null }[]): ColumnDef<Organization>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("name")}</div>
      )
    }
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "admin",
    header: "Admin",
     cell: ({ row }) => {
      const admin: {name: string, email: string, avatar: string} = row.getValue("admin")
      return (
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={admin.avatar} alt={admin.name} />
                <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <div className="font-medium">{admin.name}</div>
                <div className="text-xs text-muted-foreground">{admin.email}</div>
            </div>
        </div>
      )
    },
  },
   {
    accessorKey: "totalRecords",
    header: "Total Records",
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: "active" | "inactive" = row.getValue("status")
      return (
        <Badge variant={status === "active" ? "default" : "secondary"} className={status === "active" ? "bg-green-600" : ""}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const organization = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(organization.id)}
            >
              Copy organization ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Reports</DropdownMenuItem>
            <EditOrganizationDialog organization={organization} allAdmins={users}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit
                </DropdownMenuItem>
            </EditOrganizationDialog>
             <DeleteOrganizationDialog organizationId={organization.id} organizationName={organization.name}>
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                >
                    Delete
                </DropdownMenuItem>
            </DeleteOrganizationDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
