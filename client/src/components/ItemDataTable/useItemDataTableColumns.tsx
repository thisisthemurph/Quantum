import {ColumnDef} from "@tanstack/react-table";
import {Item, ItemWithCurrentLocation} from "@/data/models/item.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUpDown} from "lucide-react";
import {Link} from "react-router";
import {format} from "date-fns";
import {ItemDropdownMenu} from "@/components/ItemDataTable/ItemDropdownMenu.tsx";
import {toast} from "sonner";
import {useSettings} from "@/hooks/use-settings.tsx";
import {TimestampCell} from "@/components/ItemDataTable/TimestampCell.tsx";

interface ItemDataTableColumns {
  onDelete: (item: Item) => void;
}

export function useItemDataTableColumns({ onDelete }: ItemDataTableColumns) {
  const { terminology } = useSettings();

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
        <span>
          <Button variant="ghost" asChild>
            <Link to={`/items/${row.original.id}`}>
              {row.getValue("reference")}
            </Link>
          </Button>
          <Button variant="link" className="block md:hidden text-xs" asChild>
            <Link to={`/items/group/${row.original.groupKey}`}>
              {row.getValue("groupKey")}
            </Link>
          </Button>
        </span>
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
          {terminology.group} <ArrowUpDown />
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
        <span className="flex flex-col items-start">
          <Button variant="link" asChild>
            <Link to={`/locations/${row.original.currentLocation.id}`}>
              {row.getValue("currentLocation_name")}
            </Link>
          </Button>
          <span
            title={`Tracked on ${format(row.getValue("currentLocation_trackedAt"), "EEE, d MMM yyyy HH:mm")}`}
            className="inline md:hidden text-muted-foreground text-xs pl-4"
          >
            {format(row.getValue("currentLocation_trackedAt"), "PPP HH:mm")}
          </span>
        </span>
      )
    },
    {
      accessorKey: "description",
      header: () => <div>Description</div>,
      cell: ({ row }) => <div className="max-w-xs">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "currentLocation.trackedAt",
      header: () => <div>Tracked</div>,
      cell: ({ row }) => <TimestampCell value={new Date(row.getValue("currentLocation_trackedAt"))} />,
    },
    {
      accessorKey: "createdAt",
      header: () => <div>Created<span className="inline md:hidden">/Updated</span></div>,
      cell: ({ row }) => (
        <span>
          <TimestampCell value={new Date(row.getValue("createdAt"))} />
          <TimestampCell value={new Date(row.getValue("updatedAt"))} className="inline md:hidden" />
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: () => <div>Updated</div>,
      cell: ({ row }) => <TimestampCell value={new Date(row.getValue("updatedAt"))} />,
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
          onDeleteItem={() => onDelete(row.original)}
        />
      ),
    },
  ];

  return columns;
}
