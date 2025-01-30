import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, UserTrackedItems } from "@/components/AppSidebar.tsx";
import { useItemsApi } from "@/data/api/items";
import { useEffect, useState } from "react";
import {ThemeProvider} from "@/layouts/theme-provider.tsx";

export default function RootLayout() {
  const { getUserTrackedItems } = useItemsApi();
  const [userTrackedItems, setUserTrackedItems] = useState<UserTrackedItems>([]);

  useEffect(() => {
    getUserTrackedItems()
      .then((items) => setUserTrackedItems(items));
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar userItems={userTrackedItems} />
        <Outlet />
      </SidebarProvider>
    </ThemeProvider>
  )
}