import { User } from "@/data/models/user";
import { useApi } from "@/hooks/use-api";
import { useQuery } from "@tanstack/react-query";
import {UserCard} from "@/pages/settings/user-management/UserCard.tsx";

export function UserManagementTab() {
  const api = useApi();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => api<User[]>("/user").then((response) => response.data),
  });

  return (
    <div>
      <h1 className="my-4 text-xl">User management</h1>
      <section className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"}>
        {usersQuery.data && usersQuery.data.map(u => (<UserCard user={u} key={u.id} />))}
      </section>
    </div>
  );
}