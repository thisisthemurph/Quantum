import {Settings} from "@/data/models/settings.ts";

export function useSettingsApi() {
  async function updateSettings(settings: Settings): Promise<void> {
    const response = await fetch("http://localhost:42069/api/v1/settings", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to update settings");
    }
    return;
  }

  return { updateSettings };
}