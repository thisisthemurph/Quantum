import {Page} from "@/components/Page.tsx";
import {useQuery} from "@tanstack/react-query";
import {useApi} from "@/hooks/use-api.ts";
import {useParams} from "react-router";
import {User, UserRole} from "@/data/models/user.ts";
import {useSettings} from "@/hooks/use-settings.tsx";
import {Check} from "lucide-react";
import {ReactNode} from "react";
import {TerminologySettings} from "@/data/models/settings.ts";
import {UserForm} from "@/pages/settings/user-management/UserForm.tsx";

interface RoleButton {
  role: UserRole;
  title: string;
  description: (terminology: TerminologySettings) => ReactNode;
}

const roles: RoleButton[] = [
  {
    role: "admin",
    title: "Admin",
    description: (terminology) => (
      <>
        <p>An admin user is a super user that can perform all actions on the system including create, read, update, and delete users, {terminology.items.toLowerCase()} and {terminology.locations.toLowerCase()}.</p>
        <p>This role should only be given to those in trusted positions.</p>
      </>
    ),
  },
  {
    role: "writer",
    title: "Writer",
    description: (terminology) => (
      <>
        <p>A user with the writer role can create and update {terminology.items.toLowerCase()} and {terminology.locations.toLowerCase()} but cannot delete them.</p>
        <p>This role should be given to those who need to manage the system but do not require admin level permissions.</p>
      </>
    ),
  },
  {
    role: "reader",
    title: "Reader",
    description: (terminology) => (
      <>
        <p>A user with the reader role can read {terminology.items.toLowerCase()} and {terminology.locations.toLowerCase()}.</p>
        <p>This role should be given to those who need to monitor the system but do not need to perform any actions.</p>
      </>
    ),
  },
  {
    role: "tracker",
    title: "Tracker",
    description: (terminology) => (
      <>
        <p>A user with the tracker role can track {terminology.items.toLowerCase()} to any {terminology.location.toLowerCase()}.</p>
        <p>This role should be given to those who need to use the system to update the {terminology.location.toLowerCase()} of {terminology.items.toLowerCase()}.</p>
      </>
    ),
  },
];

export default function ManageUserPage() {
  const api = useApi();
  const { userId } = useParams();

  const {data: user} = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api<User>(`/user/${userId}`).then(response => response.data),
  });

  return (
    <Page title={"Manage user"}>
      {user && (
        <>
          <h1 className="text-4xl font-semibold tracking-wide">{user.name}</h1>

          <div className="flex flex-col lg:flex-row justify-between gap-8 mt-8">
            <UserForm user={user} className="grow" />
            <section className="p-4 border rounded-lg shadow">
              <h2 className="text-lg font-semibold tracking-wide pb-4">Select roles for {user.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <RoleButton
                    key={role.role}
                    active={user?.roles.includes(role.role) ?? false}
                    onClick={(role) => alert(role)}
                    {...role}
                  />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </Page>
  )
}

interface RoleButtonProps extends RoleButton {
  active: boolean;
  onClick: (role: UserRole) => void;
}

function RoleButton({role, title, description, active, onClick}: RoleButtonProps) {
  const { terminology } = useSettings();

  return (
    <button className="p-6 text-left rounded-lg border hover:bg-muted max-w-96 flex flex-col gap-2" onClick={() => onClick(role)}>
      <div className="flex justify-between items-center w-full">
        <p className="text-2xl font-semibold tracking-wide">{title}</p>
        {active && <Check/>}
      </div>
      {description(terminology)}
    </button>
  )
}
