import {ALL_ROLES, User, UserRole} from "@/data/models/user.ts";
import {useState} from "react";
import {
  ColumnFiltersState, flexRender,
  getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {Button} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {RoleBadge} from "@/components/RoleBadge.tsx";
import {cn} from "@/lib/utils.ts";
import {Input} from "@/components/ui/input.tsx";
import {useUserDataTableColumns} from "@/pages/settings/user-management/UserDataTable/useUserDataTableColumns.tsx";

interface UserDataTableProps {
  data: User[];
  isLoading: boolean;
  filteredRoles: UserRole[];
  onFilteredRolesChanged: (roles: UserRole[]) => void;
  onDelete: (user: User) => void;
}

export function UserDataTable({ data, isLoading, filteredRoles, onFilteredRolesChanged, onDelete }: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ updatedAt: false });
  const [rowSelection, setRowSelection] = useState({});

  const columns = useUserDataTableColumns({ onDelete });

  const table = useReactTable({
    data,
    columns,
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
      // @ts-expect-error: columnVisibility is not assignable to type 'VisibilityState'
      columnVisibility,
      rowSelection,
    },
  });

  function handleRoleFilterClicked(role: UserRole) {
    const currentFilterValue = (table.getColumn("name")?.getFilterValue() as string) ?? "";

    if (filteredRoles.includes(role)) {
      onFilteredRolesChanged(filteredRoles.filter((r) => r !== role));
    } else {
      onFilteredRolesChanged([...filteredRoles, role]);
    }

    // Reset the original filter value for the name column
    if (currentFilterValue) {
      table.getColumn("name")?.setFilterValue(currentFilterValue);
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <section className="flex justify-between items-center p-2">
          <Input
            placeholder="Search users by name"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="max-w-sm sm:max-w-md"
          />
          <div className={cn("flex gap-2")}>
            {ALL_ROLES.map((role) => (
              <RoleBadge
                key={role}
                role={role}
                onClick={handleRoleFilterClicked}
                tooltipOff={true}
                className={cn("", !filteredRoles.includes(role) && "bg-muted text-foreground-muted")} />
            ))}
          </div>
        </section>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Loading users..." : "No content"}
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
  )
}
