import {UserRole} from "@/data/models/user.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {cn} from "@/lib/utils.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RoleBadgeProps {
  role: UserRole;
  tooltipOff?: boolean;
  onClick?: (role: UserRole) => void;
  className?: string;
}

const tooltipText: Record<UserRole, string> = {
  "admin": "Admins have full access to all features and settings, but do not have the ability to track items.",
  "writer": "Writers can create and edit content, but cannot manage users or settings and cannot track items.",
  "reader": "Readers can only view content.",
  "tracker": "Trackers can view content and track items, but cannot create or edit content.",
}

export function RoleBadge(props: RoleBadgeProps) {
  const capitalized = props.role.charAt(0).toUpperCase() + props.role.slice(1);

  if (props.tooltipOff) {
    return <BadgeContent {...props} roleText={capitalized} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <BadgeContent {...props} roleText={capitalized} />
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <p className="text-md font-semibold mb-1 tracking-wide">{capitalized}</p>
        <p>{tooltipText[props.role]}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface BadgeContentProps extends RoleBadgeProps {
  roleText: string;
}

function BadgeContent({ role, roleText, onClick, className }: BadgeContentProps) {

  return (
    <Badge
      onClick={() => {
        if (onClick) {
          onClick(role);
        }
      }}
      className={
        cn("rounded-xl border border-1 border-black shadow-none transition-colors",
          role === "admin" && "bg-green-200 text-green-800 hover:bg-green-300",
          role === "writer" && "bg-blue-200 text-blue-800 hover:bg-blue-300",
          role === "reader" && "bg-red-100 text-red-800 hover:bg-red-200",
          role === "tracker" && "bg-purple-200 text-purple-800 hover:bg-purple-300",
          onClick && "cursor-pointer",
          className && className,
        )
      }
    >
      {roleText}
    </Badge>
  )
}