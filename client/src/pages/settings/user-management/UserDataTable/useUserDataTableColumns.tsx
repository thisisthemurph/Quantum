import {ColumnDef, FilterFn} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUpDown} from "lucide-react";
import {Link} from "react-router";
import {format} from "date-fns";
import {User} from "@/data/models/user.ts";
import {UserAvatar} from "@/components/UserAvatar.tsx";
import {RoleBadge} from "@/components/RoleBadge.tsx";
import {cn} from "@/lib/utils.ts";
import {UserDropdownMenu} from "@/pages/settings/user-management/UserDataTable/UserDropdownMenu.tsx";

const includeDeletedFilter: FilterFn<any> = (row, columnId, value) => {
  const deletedAt = row.getValue<string | null>(columnId);
  const shouldIncludeDeleted = value as boolean;
  return shouldIncludeDeleted || deletedAt === null;
}

interface UseUserDataTableColumns {
  onDelete: (user: User) => void;
}

export function useUserDataTableColumns({ onDelete }: UseUserDataTableColumns) {
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
      cell: ({ row }) => {
        const isDeleted = row.getValue("deletedAt") !== null;
        return (
          <Link to={`/user/${row.original.id}`}
            className="relative grid grid-cols-[auto_1fr] grid-rows-2 items-center transition-all hover:bg-card hover:shadow-off border border-transparent hover:border-sidebar-border p-2 rounded-lg"
          >
            <UserAvatar name={row.getValue("name")} deleted={isDeleted} className={cn("row-span-2 mr-4")}/>
            <p className="font-semibold tracking-wide">{row.getValue("name")}</p>
            <p className="text-muted-foreground font-mono">{row.original.username}</p>
            {isDeleted && <span className="absolute top-2 left-2 bg-destructive dark:bg-red-600 w-3 h-3 rounded-full" title="Deleted user"></span>}
          </Link>
        );
      },
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
      accessorKey: "deletedAt",
      filterFn: includeDeletedFilter,
      header: () => <div>Date deleted</div>,
      cell: ({ row }) => {
        const deletedAt: string = row.getValue("deletedAt");
        if (!deletedAt) return <div className="text-muted-foreground">Not deleted</div>
        return <div>{format(new Date(deletedAt), "PPP")}</div>
      },
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
        <UserDropdownMenu userId={row.original.id} onDelete={() => onDelete(row.original)} />
      ),
    },
  ];

  return columns;
}