
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
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { type Organization } from "@/app/(app)/admin/organizations/data"
import { getColumns } from "@/app/(app)/admin/organizations/columns"

interface DataTableProps {
  data: Organization[]
  allAdmins: { id: string; full_name: string | null }[]
}

const MobileCard = ({ row }: { row: any }) => {
  const organization: Organization = row.original;
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg">{organization.name}</CardTitle>
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
          <span className="text-muted-foreground">Industry</span>
          <span className="font-medium">{organization.industry}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Admin</span>
            {flexRender(
                row.getVisibleCells().find((cell: any) => cell.column.id === 'admin')?.column.columnDef.cell,
                row.getVisibleCells().find((cell: any) => cell.column.id === 'admin')?.getContext()
            )}
        </div>
        <div className="flex justify-between">
            <span className="text-muted-foreground">Total Records</span>
            <span className="font-medium">{organization.totalRecords}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Activity</span>
          <span className="font-medium">{organization.lastActivity}</span>
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


export function OrganizationsTable({
  data,
  allAdmins
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
   const [rowSelection, setRowSelection] = React.useState({})
   const isMobile = useIsMobile();
   
   const columns = React.useMemo(() => getColumns(allAdmins), [allAdmins]);

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<Organization, unknown>[],
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

  if (isMobile) {
    return (
      <div>
         <div className="flex items-center p-4 bg-card rounded-t-lg">
            <Input
            placeholder="Filter by organization name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
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
      <div className="flex items-center p-4">
        <Input
          placeholder="Filter by organization name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
