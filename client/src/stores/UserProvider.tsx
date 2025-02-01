import {useUserStore} from "@/stores/UserStore.tsx";
import {ReactNode, useEffect} from "react";

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>
}