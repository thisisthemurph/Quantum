import { Page } from "@/components/Page.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TerminologyTab } from "@/pages/settings/TerminologyTab.tsx";
import { useMutation } from "@tanstack/react-query";
import { useSettingsApi } from "@/data/api/settings.ts";
import { DefaultSettings, Settings } from "@/data/models/settings.ts";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useSettingsStore } from "@/stores/SettingsStore.tsx";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user.ts";
import { UserManagementTab } from "@/pages/settings/user-management/UserManagementTab.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs.ts";

type TabKey = "general" | "terminology" | "user-management";

const tabNames = {
  "general": "General Settings",
  "terminology": "Terminology",
  "user-management": "User Management",
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentTab = (params.get("tab") as TabKey) || "general";
  const [selectedTab, setSelectedTab] = useState<TabKey>(currentTab);
  const { setBreadcrumbs } = useBreadcrumbs();

  const user = useUser();
  const settings = useSettings();
  const { updateSettings } = useSettingsApi();
  const { fetchSettings } = useSettingsStore.getState();

  const settingsData = settings ?? DefaultSettings;

  useEffect(() => {
    navigate({
      pathname: location.pathname,
      search: `?tab=${selectedTab}`,
    });

    setBreadcrumbs({
      crumbs: [{
        href: "/settings",
        text: "Settings",
      }],
      current: tabNames[selectedTab],
    });
  }, [navigate, location.pathname, selectedTab]);

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Settings) => updateSettings(settings),
    onSuccess: async () => {
      await fetchSettings();
      toast.success("Settings updated successfully");
    },
    onError: () => toast.error("Failed to update your settings"),
  });

  return (
    <Tabs defaultValue={selectedTab} className="flex flex-col w-full grow">
      <Page
        title={selectedTab ? tabNames[selectedTab] : "Settings"}
        actionItems={
          <TabsList>
            <TabsTrigger
              value="general"
              onMouseDown={() => setSelectedTab("general")}
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="terminology"
              onMouseDown={() => setSelectedTab("terminology")}
              disabled={!user.isAdmin}
            >
              Terminology
            </TabsTrigger>
            <TabsTrigger
              value="user-management"
              onMouseDown={() => setSelectedTab("user-management")}
              disabled={!user.isAdmin}
            >
              User management
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="general">
          <p>Keep your general settings up-to-date!</p>
        </TabsContent>
        <TabsContent value="terminology">
          <TerminologyTab
            terminology={settingsData.terminology}
            onUpdate={(values) => {
              console.log("updating", values);
              updateSettingsMutation.mutate({ ...settingsData, terminology: values });
            }}
          />
        </TabsContent>
        <TabsContent value="user-management">
          <UserManagementTab />
        </TabsContent>
      </Page>
    </Tabs>
  );
}