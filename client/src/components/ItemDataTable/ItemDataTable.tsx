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
import { Columns3, ListFilter, ChevronDown, X } from "lucide-react";
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
import {Item, ItemWithCurrentLocation} from "@/data/models/item.ts";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useItemDataTableColumns } from "@/components/ItemDataTable/useItemDataTableColumns.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { PersistentColumnsContext } from "@/hooks/use-persistent-columns.ts";
import {cn} from "@/lib/utils.ts";
import {Calendar} from "@/components/ui/calendar.tsx";
import {DateRange} from "react-day-picker";
import {format} from "date-fns";

type HideableColumnName = "updated" | "created" | "description" | "location" | "tracked" | "groupKey";

type ItemDataTableProps = {
  data: ItemWithCurrentLocation[];
  persistentColumns?: PersistentColumnsContext<HideableColumnName>;
  onDeleteItem: (item: Item) => void;
}

export function ItemDataTable({ data, persistentColumns, onDeleteItem }: ItemDataTableProps) {
  const { terminology } = useSettings();
  const isMediumScreenOrSmaller = useMediaQuery("(max-width: 768px)");

  const columns = useItemDataTableColumns({
    onDelete: onDeleteItem,
  });

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filterTrackedDateRange, setFilterTrackedDateRange] = useState<DateRange | undefined>();

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
      // @ts-expect-error: Type 'VisibilityState' is not assignable to type 'Record<string, boolean>'.
      columnVisibility,
      rowSelection,
    },
  });

  const handleSelectTrackedDateRange = (range: DateRange | undefined) => {
    setFilterTrackedDateRange(range);
    console.log("Selected range:", range);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter items by reference..."
          value={(table.getColumn("reference")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("reference")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <section className="space-x-2">
          <Button variant="outline" onClick={() => setFiltersOpen(!filtersOpen)}>
            <ListFilter />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Columns3 />
                Columns
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
        </section>
      </div>
      <section className={cn("hidden py-2 gap-4", filtersOpen && "flex")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <>
              {filterTrackedDateRange?.from && filterTrackedDateRange?.to
                ? (
                  <span className="font-normal">
                    <span className="font-medium">Tracked: </span>
                    <span className="bg-accent py-1 px-2 rounded font-mono">{format(filterTrackedDateRange.from, "yyyy-MM-dd")}</span>
                    <span> to </span>
                    <span className="bg-accent py-1 px-2 rounded font-mono">{format(filterTrackedDateRange.to, "yyyy-MM-dd")}</span>
                  </span>
                )
                : <span className="font-normal"><span className="font-medium">Tracked:</span> all dates</span>}
                <ChevronDown />
              </>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-4 space-y-2">
            <Calendar
              mode="range"
              selected={filterTrackedDateRange}
              onSelect={handleSelectTrackedDateRange}
              className="rounded-md border"
            />
            <Button variant="outline" className="w-full" onClick={() => setFilterTrackedDateRange(undefined)}>Clear selection</Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
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
