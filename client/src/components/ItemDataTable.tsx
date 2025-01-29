import { useState } from "react";
import { Link } from "react-router";
import { format } from 'date-fns';
import {
  ColumnDef,
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
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
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
import { ItemDropdownMenu } from "@/components/ItemDropdownMenu.tsx";
import { toast } from "sonner";
import {useSettings} from "@/hooks/use-settings.tsx";

type HidableColumnName = "updatedAt" | "createdAt" | "description" | "location" | "groupKey";

type VisibleColumnsConfig = {
  location?: boolean;
  description?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  groupKey?: boolean;
}

const DEFAULT_VISIBLE_COLUMN_CONFIG: Record<HidableColumnName, boolean> = {
  description: true,
  groupKey: true,
  location: true,
  createdAt: false,
  updatedAt: false,
}

type ItemDataTableProps = {
  visibleColumns?: VisibleColumnsConfig;
  data: ItemWithCurrentLocation[];
}

function isVisible(column: HidableColumnName, visibility: boolean | undefined): boolean {
  if (visibility === undefined) {
    return DEFAULT_VISIBLE_COLUMN_CONFIG[column];
  }
  return visibility;
}

export function ItemDataTable({ data, visibleColumns=DEFAULT_VISIBLE_COLUMN_CONFIG }: ItemDataTableProps) {
  const { terminology } = useSettings();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: isVisible("description", visibleColumns?.description),
    groupKey: isVisible("groupKey", visibleColumns?.groupKey),
    createdAt: isVisible("createdAt", visibleColumns?.createdAt),
    updatedAt: isVisible("updatedAt", visibleColumns?.updatedAt),
    "currentLocation_name": isVisible("location", visibleColumns?.location),

  });
  const [rowSelection, setRowSelection] = useState({});

  const columnNameMapping: { [key: string]: string } = {
    "createdAt": "created",
    "updatedAt": "updated",
    "currentLocation_name": terminology.location,
  }

  const columns: ColumnDef<ItemWithCurrentLocation>[] = [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
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
    },
    {
      accessorKey: "reference",
      enableHiding: false,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reference <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Button variant="ghost" asChild>
          <Link to={`/items/${row.original.id}`}>
            {row.getValue("reference")}
          </Link>
        </Button>
      ),
    },
    {
      accessorKey: "groupKey",
      enableHiding: false,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Group <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <Button variant="ghost" asChild>
          <Link to={`/items/group/${row.original.groupKey}`}>
            {row.getValue("groupKey")}
          </Link>
        </Button>
      ),
    },
    {
      accessorKey: "currentLocation.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {terminology.location} <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <Button variant="ghost" asChild>
          <Link to={`/locations/${row.original.currentLocation.id}`}>
            {row.getValue("currentLocation_name")}
          </Link>
        </Button>
      )
    },
    {
      accessorKey: "description",
      header: () => <div>Description</div>,
    },
    {
      accessorKey: "createdAt",
      header: () => <div>Created</div>,
      cell: ({ row }) => <div>{format(new Date(row.getValue("createdAt")), "PPP")}</div>,
    },
    {
      accessorKey: "updatedAt",
      header: () => <div>Updated</div>,
      cell: ({ row }) => <div>{format(new Date(row.getValue("updatedAt")), "PPP")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <ItemDropdownMenu
          itemId={row.original.id}
          onTrackToSelf={() => {
            toast.error("Item tracking is not currently implemented");
          }}
          onCopyReference={() => {
            navigator.clipboard.writeText(row.original.reference)
              .then(() => toast.success(`Reference ${row.original.reference} copied to clipboard`));
          }}
          onCopyDescription={() => {
            if (!row.original.description) {
              toast.warning("No description to copy");
              return;
            }
            navigator.clipboard.writeText(row.original.description)
              .then(() => toast.success("Description copied to clipboard"));
          }}
          onDeleteItem={() => {
            toast.error("Item deletion is not currently implemented");
          }}
        />
      ),
    },
  ];

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
                    <TableCell key={cell.id}>
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
