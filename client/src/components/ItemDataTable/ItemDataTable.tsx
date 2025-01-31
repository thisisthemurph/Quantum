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

type HideableColumnName = "updatedAt" | "createdAt" | "description" | "location" | "groupKey";

type VisibleColumnsConfig = {
  location?: boolean;
  description?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  groupKey?: boolean;
}

const DEFAULT_VISIBLE_COLUMN_CONFIG: Record<HideableColumnName, boolean> = {
  description: false,
  groupKey: true,
  location: true,
  createdAt: true,
  updatedAt: true,
}

function isVisible(column: HideableColumnName, visibility: boolean | undefined): boolean {
  if (visibility === undefined) {
    return DEFAULT_VISIBLE_COLUMN_CONFIG[column];
  }
  return visibility;
}

type ItemDataTableProps = {
  visibleColumns?: VisibleColumnsConfig;
  data: ItemWithCurrentLocation[];
}

export function ItemDataTable({ data, visibleColumns=DEFAULT_VISIBLE_COLUMN_CONFIG }: ItemDataTableProps) {
  const { terminology } = useSettings();
  const isMediumScreenOrSmaller = useMediaQuery("(max-width: 768px)");
  const columns = useItemDataTableColumns();

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: isVisible("description", visibleColumns?.description),
    groupKey: isVisible("groupKey", visibleColumns?.groupKey),
    createdAt: isVisible("createdAt", visibleColumns?.createdAt),
    updatedAt: isVisible("updatedAt", visibleColumns?.updatedAt),
    "currentLocation_name": isVisible("location", visibleColumns?.location),
  });

  useEffect(() => {
    setColumnVisibility((prev) => ({
      ...prev,
      "groupKey": !isMediumScreenOrSmaller,
      "updatedAt": !isMediumScreenOrSmaller,
      "currentLocation_trackedAt": !isMediumScreenOrSmaller,
    }));
  }, [isMediumScreenOrSmaller]);

  const columnNameMapping: { [key: string]: string } = {
    "createdAt": "created",
    "updatedAt": "updated",
    "currentLocation_name": terminology.location,
    "currentLocation_trackedAt": "Tracked",
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
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnNameMapping[column.id] ?? column.id}
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
