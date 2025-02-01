import {Outlet, useNavigate} from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, UserTrackedItems } from "@/components/AppSidebar.tsx";
import { useItemsApi } from "@/data/api/items";
import { useEffect, useState } from "react";
import {useUser} from "@/hooks/use-user.ts";
import {useUserStore} from "@/stores/UserStore.tsx";

export default function RootLayout() {
  const { getUserTrackedItems } = useItemsApi();
  const [userTrackedItems, setUserTrackedItems] = useState<UserTrackedItems>([]);
  const user = useUser();
  const { fetchUser } = useUserStore.getState();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().then((success) => {
        if (!success) {
          navigate("/login");
        }
      }).catch(() => {
        navigate("/login");
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getUserTrackedItems()
      .then((items) => setUserTrackedItems(items));
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar userItems={userTrackedItems} />
      <Outlet />
    </SidebarProvider>
  )
}