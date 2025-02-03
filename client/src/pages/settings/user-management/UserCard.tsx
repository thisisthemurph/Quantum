import { User, UserRole } from "@/data/models/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {useState} from "react";
import {cn} from "@/lib/utils.ts";
import {toast} from "sonner";
import {Link} from "react-router";

function avatarInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
}

const ALL_ROLES: UserRole[] = ["admin", "writer", "reader", "tracker"]

export function UserCard({ user }: { user: User }) {
  const initials = avatarInitials(user.name);
  const [showRoleButtons, setShowRoleButtons] = useState(false);

  function handleRoleSelected(role: UserRole) {
    console.log(role);
    setShowRoleButtons(false);
    if (user.roles.includes(role)) {
      if (user.roles.length === 1) {
        toast.error("A user must have at least one role");
        return;
      }
      user.roles.splice(user.roles.indexOf(role), 1)
    } else {
      user.roles.push(role);
    }
  }

  return (
    <Card className="group relative">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl hover:underline underline-offset-2">
            <Link to={`/user/${user.id}`}>{user.name}</Link>
          </CardTitle>
          <CardDescription className="font-mono">{user.username.toLowerCase()}</CardDescription>
        </div>
        <Avatar onClick={() => alert("Avatar clicked")}>
          <AvatarFallback className="bg-purple-200/80">{initials}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-end justify-between">
          <p className="text-muted-foreground py-1">Roles</p>
          <button onClick={() => setShowRoleButtons(!showRoleButtons)} className="flex gap-1 border border-transparent hover:border-slate-200 p-1 rounded-lg">
            {user.roles.includes("admin")
              ? <Badge variant="secondary">admin</Badge>
              : (user.roles.map((role) => (
                  <Badge variant="secondary" key={role}>{role}</Badge>
                )))
            }
          </button>
        </div>
      </CardContent>
      <div className={cn("hidden absolute bottom-0 w-full", showRoleButtons && "flex justify-center")}>
        <section className={cn("translate-y-[50%] gap-1 items-center justify-center border p-2 rounded-lg shadow bg-card z-10", showRoleButtons && "flex")}>
          {ALL_ROLES.map((role) => {
            return <RoleButton key={role} role={role} selected={user.roles.includes(role)} onClick={handleRoleSelected} />
          })}
        </section>
      </div>
    </Card>
  );
}

function RoleButton({role, selected, onClick}: {role: UserRole, selected: boolean, onClick: (role: UserRole) => void}) {
  return (
    <Badge variant="secondary" className={cn("", selected && "bg-green-200 dark:text-card")}>
      <button onClick={() => onClick(role)}>
        {role}
      </button>
    </Badge>
  )
}