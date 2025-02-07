import { User, UserRole } from "@/data/models/user";
import { useApi } from "@/hooks/use-api";
import { useQuery } from "@tanstack/react-query";
import {UserDataTable} from "@/pages/settings/user-management/UserDataTable.tsx";
import {useState} from "react";
import {CreateUserButton} from "@/pages/settings/user-management/CreateUserButton.tsx";
import {useUser} from "@/hooks/use-user.ts";

export function UserManagementTab() {
  const user = useUser();
  const api = useApi();
  const [roleFilter, setRoleFilter] = useState<UserRole[]>([]);

  const usersQuery = useQuery({
    queryKey: ["users", roleFilter],
    queryFn: async () => {
      let url = "/user";
      if (roleFilter && roleFilter.length > 0) {
        const params = new URLSearchParams({ roles: roleFilter.map(r => r.toString()).join(",") });
        url = `${url}?${params.toString()}`;
      }
      const result = await api<User[]>(url);
      return result.data;
    }
  });

  function filterUsersByRole(roles: UserRole[]) {
    setRoleFilter(roles);
  }

  return (
    <div>
      <section className="flex justify-between items-center">
        <h1 className="my-4 text-xl">User management</h1>
        {user.isAdmin && <CreateUserButton text="Create new user"/>}
      </section>
      <section className="grid grid-cols-1">
        <UserDataTable
          data={usersQuery.data ?? []}
          isLoading={usersQuery.isLoading}
          filteredRoles={roleFilter}
          onFilteredRolesChanged={filterUsersByRole} />
      </section>
    </div>
  );
}