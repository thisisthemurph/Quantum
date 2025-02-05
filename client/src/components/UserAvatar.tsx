import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import { cn } from "@/lib/utils";

function avatarInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
}

interface UserAvatarProps {
  name: string;
  className?: string;
}

export function UserAvatar({name, className}: UserAvatarProps) {
  const initials = avatarInitials(name);

  return (
    <Avatar className={cn("", className)}>
      <AvatarFallback className="bg-purple-200/80" title={name}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}