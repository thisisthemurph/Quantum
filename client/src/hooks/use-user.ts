import { useUserStore } from "@/stores/UserStore.tsx";
import { UserPermissions } from "@/data/models/user.ts";
import { useMemo } from "react";

export const useUser = () => {
  const user = useUserStore((state) => state.user);
  return useMemo(() => new UserPermissions(user), [user]);
};
