import { useEffect, useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { ItemWithCurrentLocation } from "@/data/models/item.ts";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useItemDataTableColumns } from "@/components/ItemDataTable/useItemDataTableColumns.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { PersistentColumnsContext } from "@/hooks/use-persistent-columns.ts";

type HideableColumnName = "updated" | "created" | "description" | "location" | "tracked" | "groupKey";

type ItemDataTableProps = {
  data: ItemWithCurrentLocation[];
  persistentColumns?: PersistentColumnsContext<HideableColumnName>;
}

export function ItemDataTable({ data, persistentColumns }: ItemDataTableProps) {
  const { terminology } = useSettings();
  const isMediumScreenOrSmaller = useMediaQuery("(max-width: 768px)");
  const columns = useItemDataTableColumns();

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: persistentColumns?.columns.description ?? false,
    groupKey: !isMediumScreenOrSmaller,
    createdAt: persistentColumns?.columns.created ?? true,
    updatedAt: !isMediumScreenOrSmaller && (persistentColumns?.columns.updated ?? true),
    "currentLocation_name": !isMediumScreenOrSmaller && (persistentColumns?.columns.tracked ?? true),
  });

  useEffect(() => {
    setColumnVisibility((prev) => {
      return {
        ...prev,
        "groupKey": !isMediumScreenOrSmaller,
        "currentLocation_name": persistentColumns?.columns.location ?? true,
        "description": persistentColumns?.columns.description ?? false,
        "createdAt": persistentColumns?.columns.created ?? true,
        "updatedAt": !isMediumScreenOrSmaller && (persistentColumns?.columns.updated ?? true),
        "currentLocation_trackedAt": !isMediumScreenOrSmaller && (persistentColumns?.columns.tracked ?? true),
      }
    });
  }, [isMediumScreenOrSmaller, persistentColumns]);

  const columnNameMapping: { [key: string]: string } = {
    "createdAt": "created",
    "updatedAt": "updated",
    "currentLocation_name": terminology.location.toLowerCase(),
    "currentLocation_trackedAt": "tracked",
  };

  const table = useReactTable({
    data,
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter items by reference..."
          value={(table.getColumn("reference")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("reference")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnName = columnNameMapping[column.id] ?? column.id;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(displayColumn) => {
                      column.toggleVisibility(displayColumn);
                      if (persistentColumns)
                        persistentColumns.setColumnVisibility(columnName as HideableColumnName, displayColumn);
                    }}
                  >
                    {columnName}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
                    <TableCell className="min-w-0" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row{table.getFilteredRowModel().rows.length > 1 ? "s" : null} selected.
        </div>
        <div className="space-x-2">
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
    </div>
  );
}
