import {ChevronUp, Home, Package, Map, User, Settings, LogOut, SunMoon, Sun, Moon} from "lucide-react"
import {Link, useLocation} from "react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useSettings } from "@/hooks/use-settings.tsx";
import {Theme, useTheme} from "@/layouts/theme-provider.tsx";
import * as React from "react";

type SidebarItem = {
  title: string;
  url: string;
  icon: React.FC;
};

type UserTrackedItem = {
  id: string;
  reference: string;
};

export type UserTrackedItems = UserTrackedItem[];

interface AppSidebarProps {
  userItems: UserTrackedItems;
}

const themes: { key: Theme, title: string, icon: React.FC }[] = [
  { key: "system", title: "System", icon: SunMoon },
  { key: "light", title: "Light", icon: Sun },
  { key: "dark", title: "Dark", icon: Moon },
];

export function AppSidebar({ userItems: userOwnedItems }: AppSidebarProps) {
  const sidebar = useSidebar();
  const { terminology } = useSettings();
  const location = useLocation();
  const { theme: currentTheme, setTheme } = useTheme();

  const items: SidebarItem[] = [
    { title: "Home", url: "/", icon: Home },
    { title: terminology.items, url: "/items", icon: Package },
    { title: terminology.locations, url: "/locations", icon: Map },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-6">
            <Link to="/" className="text-xl hover:text-accent-foreground transition-colors">Quantum</Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={item.url === location.pathname}
                    className="text-lg"
                    asChild
                  >
                    <Link to={item.url} className="">
                      <item.icon />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className={cn("hidden", sidebar.open && userOwnedItems.length > 0 && "flex")}>
          <SidebarGroupLabel>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2">
                <span>Your {terminology.items.toLowerCase()}</span>
                <Badge className="rounded-full h-4 justify-center bg-slate-600">
                  {userOwnedItems.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="mx-1">
                <p>You have {userOwnedItems.length} items tracked to yourself</p>
              </TooltipContent>
            </Tooltip>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userOwnedItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/items/${item.id}`}>
                      {item.reference.toUpperCase()}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuLabel>Username</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="w-5 h-5" />
                    <span>Account</span>
                    <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-5 h-5" />
                    <Link to="/settings" className="w-full">Settings</Link>
                    <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <SunMoon className="w-5 h-5" />
                      <span>Select theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {themes.map((theme) => (
                          <DropdownMenuItem
                            key={theme.key}
                            onClick={() => setTheme(theme.key)}
                            className="cursor-pointer"
                            disabled={theme.key === currentTheme}
                          >
                            <theme.icon />
                            <div className="w-full flex justify-between items-center gap-2">
                              <span>{theme.title}</span>
                              {theme.key === currentTheme && <div className="block w-2 h-2 bg-border rounded-full"></div>}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <LogOut className="w-5 h-5" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar >
  )
}