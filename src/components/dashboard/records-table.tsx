
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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { type Record } from "@/app/(app)/dashboard/records/data"
import { getColumns } from "@/app/(app)/dashboard/records/columns"


interface DataTableProps<TData, TValue> {
  data: TData[],
  userRole: "staff" | "client" | "admin"
}

const MobileCard = ({ row }: { row: any }) => {
  const record: Record = row.original;
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex items-center gap-3">
             {flexRender(
                row.getVisibleCells().find((cell: any) => cell.column.id === 'fileName')?.column.columnDef.cell,
                row.getVisibleCells().find((cell: any) => cell.column.id === 'fileName')?.getContext()
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
          <span className="text-muted-foreground">Upload Date</span>
          <span className="font-medium">{new Date(record.uploadDate).toLocaleDateString()}</span>
        </div>
         <div className="flex justify-between">
          <span className="text-muted-foreground">File Size</span>
          <span className="font-medium">{`${(record.fileSize / (1024*1024)).toFixed(2)} MB`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          {flexRender(
            row.getVisibleCells().find((cell: any) => cell.column.id === "status")
              ?.column.columnDef.cell,
            row.getVisibleCells().find((cell: any) => cell.column.id === "status")?.getContext()
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Risk Level</span>
          {flexRender(
            row.getVisibleCells().find((cell: any) => cell.column.id === "riskLevel")
              ?.column.columnDef.cell,
            row.getVisibleCells().find((cell: any) => cell.column.id === "riskLevel")?.getContext()
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function RecordsTable<TData, TValue>({
  data,
  userRole,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
   const [rowSelection, setRowSelection] = React.useState({})
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    })
    const isMobile = useIsMobile();

  const columns = React.useMemo(() => getColumns(userRole), [userRole]);

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData, TValue>[],
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

  // This effect is a placeholder for filtering by date range.
  // In a real app, you'd pass the date range to your API fetch function.
  React.useEffect(() => {
    // A simple client-side filter for demonstration.
    // This is not efficient for large datasets.
    const dateFilter = (row: any) => {
        const rowDate = new Date(row.getValue('uploadDate'));
        if (date?.from && date.to) {
            return rowDate >= date.from && rowDate <= date.to;
        }
        return true;
    }
    // This is a way to add a global filter function, but react-table
    // doesn't directly support multiple global filters out of the box.
    // For a real implementation, filtering logic should be part of the API call.
  }, [date, table])


  if (isMobile) {
    return (
      <div>
        <div className="p-4 bg-card rounded-t-lg space-y-4">
            <Input
            placeholder="Filter by file name..."
            value={(table.getColumn("fileName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("fileName")?.setFilterValue(event.target.value)
            }
            className="w-full"
            />
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0 w-1/2">
                        File Type <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    {['PDF', 'Excel', 'CSV'].map((type) => (
                        <DropdownMenuCheckboxItem key={type} className="capitalize" checked={(table.getColumn("fileType")?.getFilterValue() as string[] | undefined)?.includes(type) ?? false} onCheckedChange={(value) => { const currentFilter = (table.getColumn("fileType")?.getFilterValue() as string[] | undefined) || []; let newFilter: string[] | undefined; if (value) { newFilter = [...currentFilter, type]; } else { newFilter = currentFilter.filter(f => f !== type); } if (newFilter.length === 0) { newFilter = undefined; } table.getColumn("fileType")?.setFilterValue(newFilter); }}>
                        {type}
                        </DropdownMenuCheckboxItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0 w-1/2">
                        Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    {['pending', 'processing', 'completed', 'failed'].map((status) => (
                        <DropdownMenuCheckboxItem key={status} className="capitalize" checked={(table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status) ?? false} onCheckedChange={(value) => { const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] | undefined) || []; let newFilter: string[] | undefined; if (value) { newFilter = [...currentFilter, status]; } else { newFilter = currentFilter.filter(f => f !== status); } if (newFilter.length === 0) { newFilter = undefined; } table.getColumn("status")?.setFilterValue(newFilter); }}>
                        {status}
                        </DropdownMenuCheckboxItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
             <Popover>
              <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
              </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={1} />
              </PopoverContent>
          </Popover>
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
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
            </Button>
        </div>
      </div>
    );
  }

  return (
     <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center gap-4 p-4">
        <Input
          placeholder="Filter by file name..."
          value={(table.getColumn("fileName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fileName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                File Type <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['PDF', 'Excel', 'CSV'].map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  className="capitalize"
                   checked={
                    (table.getColumn("fileType")?.getFilterValue() as string[] | undefined)?.includes(type) ?? false
                  }
                  onCheckedChange={(value) => {
                      const currentFilter = (table.getColumn("fileType")?.getFilterValue() as string[] | undefined) || [];
                      let newFilter: string[] | undefined;
                      if (value) {
                          newFilter = [...currentFilter, type];
                      } else {
                          newFilter = currentFilter.filter(f => f !== type);
                      }
                      if (newFilter.length === 0) {
                          newFilter = undefined;
                      }
                      table.getColumn("fileType")?.setFilterValue(newFilter);
                  }}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['pending', 'processing', 'completed', 'failed'].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize"
                  checked={
                    (table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status) ?? false
                  }
                  onCheckedChange={(value) => {
                     const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] | undefined) || [];
                      let newFilter: string[] | undefined;
                      if (value) {
                          newFilter = [...currentFilter, status];
                      } else {
                          newFilter = currentFilter.filter(f => f !== status);
                      }
                      if (newFilter.length === 0) {
                          newFilter = undefined;
                      }
                      table.getColumn("status")?.setFilterValue(newFilter);
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-full sm:w-auto">
          <Popover>
              <PopoverTrigger asChild>
              <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                  )}
              >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                  date.to ? (
                      <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                      </>
                  ) : (
                      format(date.from, "LLL dd, y")
                  )
                  ) : (
                  <span>Pick a date range</span>
                  )}
              </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
              />
              </PopoverContent>
          </Popover>
        </div>
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
