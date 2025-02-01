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
import {toast} from "sonner";

export default function SettingsPage() {
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
      <Tabs defaultValue="terminology">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="terminology">Terminology</TabsTrigger>
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
      </Tabs>
    </Page>
  );
}