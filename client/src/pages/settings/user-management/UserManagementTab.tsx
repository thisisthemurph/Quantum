import { User, UserRole } from "@/data/models/user";
import { useApi } from "@/hooks/use-api";
import {useMutation, useQuery} from "@tanstack/react-query";
import {UserDataTable} from "@/pages/settings/user-management/UserDataTable/UserDataTable.tsx";
import {useState} from "react";
import {CreateUserButton} from "@/pages/settings/user-management/CreateUserButton.tsx";
import {useUser} from "@/hooks/use-user.ts";
import {toast} from "sonner";

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

  const deleteUserMutation = useMutation({
    mutationFn: async (user: User) => {
      const result = await api<void>(`/user/${user.id}`, {
        method: "DELETE",
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Failed to delete user");
      }

      return user;
    },
    onSuccess: (user) => toast.success("User deleted", { description: `User ${user.username} has been deleted` }),
    onError: (err) => toast.error(err.message),
  });

  function filterUsersByRole(roles: UserRole[]) {
    setRoleFilter(roles);
  }

  return (
    <div>
      <section className="flex justify-end items-center mb-2">
        {user.isAdmin && <CreateUserButton text="Create new user"/>}
      </section>
      <section className="grid grid-cols-1">
        <UserDataTable
          data={usersQuery.data ?? []}
          isLoading={usersQuery.isLoading}
          filteredRoles={roleFilter}
          onFilteredRolesChanged={filterUsersByRole}
          onDelete={(user) => deleteUserMutation.mutate(user)}
        />
      </section>
    </div>
  );
}