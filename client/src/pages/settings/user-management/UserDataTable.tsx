import {ALL_ROLES, User, UserRole} from "@/data/models/user.ts";
import {useState} from "react";
import {
  ColumnDef,
  ColumnFiltersState, flexRender,
  getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUpDown} from "lucide-react";
import {format} from "date-fns";
import {toast} from "sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {UserAvatar} from "@/components/UserAvatar.tsx";
import {RoleBadge} from "@/components/RoleBadge.tsx";
import {cn} from "@/lib/utils.ts";
import {UserDropdownMenu} from "@/pages/settings/user-management/UserDropdownMenu.tsx";
import {Input} from "@/components/ui/input.tsx";

const columns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    enableHiding: false,
    header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown />
      </Button>
    )
  },
    cell: ({ row }) => (
      <div className="grid grid-cols-[auto_1fr] grid-rows-2 items-center">
        <UserAvatar name={row.getValue("name")} className="row-span-2 mr-4" />
        <p className="font-semibold tracking-wide">{row.getValue("name")}</p>
        <p className="text-muted-foreground font-mono">{row.original.username}</p>
      </div>
    ),
  },
  {
    accessorKey: "access",
    enableHiding: false,
    header: () => <div>Access</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.roles.map((role) => (<RoleBadge key={`${row.original.id}-${role}`} role={role} />))}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div>Date added</div>,
    cell: ({ row }) => <div>{format(new Date(row.getValue("createdAt")), "PPP")}</div>,
  },
  {
    accessorKey: "lastLoggedInAt",
    header: () => <div>Last login</div>,
    cell: ({ row }) => {
      const date: string = row.getValue("lastLoggedInAt");
      const formatted = date ? format(new Date(date), "PPP") : "Never";
      return <div className={cn("", !date && "text-muted-foreground")}>{formatted}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <UserDropdownMenu userId={row.original.id} onDelete={() => toast.warning("NOT IMPLEMENTED")} />
    ),
  },
];

interface UserDataTableProps {
  data: User[];
  isLoading: boolean;
  filteredRoles: UserRole[];
  onFilteredRolesChanged: (roles: UserRole[]) => void;
}

export function UserDataTable({ data, isLoading, filteredRoles, onFilteredRolesChanged }: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ updatedAt: false });
  const [rowSelection, setRowSelection] = useState({});

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
              className={cn("", !filteredRoles.includes(role) && "bg-muted text-slate-800")} />
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
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {isLoading ? "Loading users..." : "No content"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
