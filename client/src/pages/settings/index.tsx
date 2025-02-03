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
import {UserManagementTab} from "@/pages/settings/user-management/UserManagementTab.tsx";

export default function SettingsPage() {
  const user = useUser();
  const settings = useSettings();
  const { updateSettings } = useSettingsApi();
  const { fetchSettings } = useSettingsStore.getState();

  const settingsData = settings ?? DefaultSettings;

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Settings) => updateSettings(settings),
    onSuccess: async () => {
      await fetchSettings();
      toast.success("Settings updated successfully");
    },
    onError: () => toast.error("Failed to update your settings"),
  });

  return (
    <Page title="Settings">
      <Tabs defaultValue="user-management">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="terminology" disabled={!user.isAdmin}>Terminology</TabsTrigger>
          <TabsTrigger value="user-management" disabled={!user.isAdmin}>User management</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <h1>General settings</h1>
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
        <TabsContent value={"user-management"}>
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </Page>
  );
}