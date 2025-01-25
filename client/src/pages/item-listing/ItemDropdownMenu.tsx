import { Copy, Eye, SquareArrowDown, Trash } from "lucide-react";
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

interface ItemDropdownMenuProps {
  itemId: string;
  onTrackToSelf: () => void;
  onCopyReference: () => void;
  onCopyDescription: () => void;
  onDeleteItem: () => void;
}

export function ItemDropdownMenu({ itemId, onTrackToSelf, onCopyDescription, onCopyReference, onDeleteItem }: ItemDropdownMenuProps) {
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
          Copy item reference
          <Copy strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between items-center gap-4 cursor-pointer"
          onClick={onCopyDescription}
        >
          Copy item description
          <Copy strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" asChild>
          <Link to={`/items/${itemId}`}>
            <span>View item</span>
            <Eye strokeWidth={1} className="w-4 h-4" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" onMouseDown={onDeleteItem}>
          Delete item
          <Trash strokeWidth={1} className="w-4 h-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}