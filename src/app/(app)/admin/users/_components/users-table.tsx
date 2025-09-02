
'use client'

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/lib/types"
import { format } from 'date-fns'
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from 'next/navigation';
import { updateUserRole, toggleUserActive } from "../actions";
import { useToast } from "@/hooks/use-toast"

type UserWithOrg = Profile & { organization: { name: string } | null };

export function UsersTable({ users, pageCount }: { users: UserWithOrg[], pageCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, role: 'admin' | 'staff' | 'client') => {
    try {
      await updateUserRole(userId, role);
      toast({ title: "Success", description: "User role updated." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    }
  };

  const handleActiveToggle = async (userId: string, isActive: boolean) => {
     try {
      await toggleUserActive(userId, isActive);
      toast({ title: "Success", description: `User has been ${isActive ? 'activated' : 'deactivated'}.` });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
    }
  }


  const columns: ColumnDef<UserWithOrg>[] = [
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
      accessorKey: "full_name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <div className="font-medium">{row.original.full_name}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
    },
    {
      header: "Organization",
      accessorFn: row => row.organization?.name,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "destructive"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined Date",
      cell: ({ row }) => format(new Date(row.original.created_at), "PPP"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>Set as Admin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'staff')}>Set as Staff</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleActiveToggle(user.id, !user.is_active)}>
                {user.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])


  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
     onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection,
      columnFilters,
    },
    pageCount,
    manualPagination: true,
  })

  return (
    <div className="w-full">
       <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
       <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
    </div>
  )
}
