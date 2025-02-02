import { Copy, Eye, Trash } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import {useSettings} from "@/hooks/use-settings.tsx";
import { useUser } from "@/hooks/use-user.ts";

interface LocationDropdownMenuProps {
  locationId: string;
  onCopyName: () => void;
  onCopyDescription: () => void;
  onDelete: () => void;
}

export function LocationDropdownMenu({ locationId, onCopyDescription, onCopyName, onDelete }: LocationDropdownMenuProps) {
  const user = useUser();
  const { terminology } = useSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between items-center gap-4 cursor-pointer"
          onClick={onCopyName}
        >
          Copy {terminology.location.toLowerCase()} reference
          <Copy strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between items-center gap-4 cursor-pointer"
          onClick={onCopyDescription}
        >
          Copy {terminology.location.toLowerCase()} description
          <Copy strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" asChild>
          <Link to={`/locations/${locationId}`}>
            <span>View {terminology.location.toLowerCase()}</span>
            <Eye strokeWidth={1} className="w-4 h-4" />
          </Link>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" onMouseDown={onDelete}>
            Delete {terminology.location.toLowerCase()}
            <Trash strokeWidth={1} className="w-4 h-4"/>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}