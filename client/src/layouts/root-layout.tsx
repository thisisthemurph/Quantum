import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, UserTrackedItems } from "@/components/app-sidebar";
import { useItemsApi } from "@/data/api/items";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const { getUserTrackedItems } = useItemsApi();
  const [userTrackedItems, setUserTrackedItems] = useState<UserTrackedItems>([]);

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