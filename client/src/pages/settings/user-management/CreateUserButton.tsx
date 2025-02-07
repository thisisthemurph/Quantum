import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router";
import {UserPlus} from "lucide-react";

export function CreateUserButton({ text }: { text: string }) {
  return (
    <Button variant="outline" asChild>
      <Link to="/user/create" className="flex items-center gap-2">
        <UserPlus strokeWidth={1} className="w-5 h-5" />
        <span>{text}</span>
      </Link>
    </Button>
  )
}