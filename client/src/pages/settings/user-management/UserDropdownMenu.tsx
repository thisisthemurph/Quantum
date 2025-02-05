import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Eye, MoreHorizontal, Trash} from "lucide-react";
import {Link} from "react-router";

interface UserDropdownMenuProps {
  userId: string;
  onDelete: () => void;
}

export function UserDropdownMenu({ userId, onDelete }: UserDropdownMenuProps) {
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
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" asChild>
          <Link to={`/user/${userId}`}>
            <span>View user</span>
            <Eye strokeWidth={1} className="w-4 h-4" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between items-center gap-4 cursor-pointer" onMouseDown={onDelete}>
          Delete user
          <Trash strokeWidth={1} className="w-4 h-4"/>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}