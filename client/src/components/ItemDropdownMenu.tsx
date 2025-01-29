import { Copy, Eye, SquareArrowDown, Trash } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Link } from "react-router";
import {useSettings} from "@/hooks/use-settings.tsx";

interface ItemDropdownMenuProps {
  itemId: string;
  onTrackToSelf: () => void;
  onCopyReference: () => void;
  onCopyDescription: () => void;
  onDeleteItem: () => void;
}

export function ItemDropdownMenu({ itemId, onTrackToSelf, onCopyDescription, onCopyReference, onDeleteItem }: ItemDropdownMenuProps) {
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
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" onMouseDown={onTrackToSelf}>
          Track to me
          <SquareArrowDown strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between items-center gap-4 cursor-pointer"
          onClick={onCopyReference}
        >
          Copy {terminology.item.toLowerCase()} reference
          <Copy strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between items-center gap-4 cursor-pointer"
          onClick={onCopyDescription}
        >
          Copy {terminology.item.toLowerCase()} description
          <Copy strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" asChild>
          <Link to={`/items/${itemId}`}>
            <span>View {terminology.item.toLowerCase()}</span>
            <Eye strokeWidth={1} className="w-4 h-4" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" onMouseDown={onDeleteItem}>
          Delete {terminology.item.toLowerCase()}
          <Trash strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}