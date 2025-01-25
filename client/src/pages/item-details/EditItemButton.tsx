import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export function EditItemButton() {
  return (
    <Button asChild>
      <Link to="/items/edit" className="flex items-center gap-2">
        <span>Edit</span>
        <Pencil size={14} strokeWidth={2} />
      </Link>
    </Button>
  );
}
