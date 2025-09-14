
"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { type User, type Org } from "@/app/(app)/admin/users/data"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { getColumns } from "@/app/(app)/admin/users/columns"


interface DataTableProps {
  data: User[]
  organizations: Org[]
}

const MobileCard = ({ row }: { row: any }) => {
  const user: User = row.original;
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between p-4">
         <div>
            {flexRender(
                row.getVisibleCells().find((cell: any) => cell.column.id === 'fullName')?.column.columnDef.cell,
                row.getVisibleCells().find((cell: any) => cell.column.id === 'fullName')?.getContext()
            )}
        </div>
        <div className="text-sm">
          {flexRender(
            row.getVisibleCells().find((cell: any) => cell.column.id === "actions")
              ?.column.columnDef.cell,
            row.getVisibleCells().find((cell: any) => cell.column.id === "actions")?.getContext()
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Role</span>
           {flexRender(
            row.getVisibleCells().find((cell: any) => cell.column.id === "role")
              ?.column.columnDef.cell,
            row.getVisibleCells().find((cell: any) => cell.column.id === "role")?.getContext()
          )}
        </div>
         <div className="flex justify-between">
          <span className="text-muted-foreground">Organization</span>
          <span className="font-medium">{user.organization}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Login</span>
          <span className="font-medium">{user.lastLogin}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          {flexRender(
            row.getVisibleCells().find((cell: any) => cell.column.id === "status")
              ?.column.columnDef.cell,
            row.getVisibleCells().find((cell: any) => cell.column.id === "status")?.getContext()
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function UsersTable({
  data,
  organizations,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
   const [rowSelection, setRowSelection] = React.useState({})
   const [roleFilter, setRoleFilter] = React.useState("all")
   const isMobile = useIsMobile();
   
   const columns = React.useMemo(() => getColumns(organizations), [organizations]);


  const table = useReactTable({
    data,
    columns: columns as ColumnDef<User, unknown>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  React.useEffect(() => {
    if (roleFilter === 'all') {
        table.getColumn('role')?.setFilterValue(undefined)
    } else {
        table.getColumn('role')?.setFilterValue(roleFilter)
    }
  }, [roleFilter, table])


  if (isMobile) {
    return (
      <div>
         <div className="p-4 bg-card rounded-t-lg space-y-4">
            <Input
            placeholder="Filter by email..."
            value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
                table.getColumn("fullName")?.setFilterValue(event.target.value)
                }
            }
            className="w-full"
            />
             <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="admin">Admins</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="client">Clients</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div className="p-4 space-y-4 bg-muted/40">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <MobileCard key={row.id} row={row} />
          ))
        ) : (
          <div className="text-center py-10">No results.</div>
        )}
        </div>
         <div className="flex items-center justify-end space-x-2 p-4 border-t bg-card rounded-b-lg">
         <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
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
      </div>
    )
  }

  return (
     <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
              // This is filtering by user column which has name and email.
              // A bit of a hack for demo purposes.
              table.getColumn("fullName")?.setFilterValue(event.target.value)
            }
          }
          className="max-w-sm"
        />
         <Tabs value={roleFilter} onValueChange={setRoleFilter}>
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="client">Clients</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>
      <div className="border-t">
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
      <div className="flex items-center justify-end space-x-2 p-4 border-t">
         <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
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
    </div>
  )
}
