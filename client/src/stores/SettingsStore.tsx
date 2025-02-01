import { create } from "zustand";
import { Settings } from "@/data/models/settings.ts";

interface SettingsStoreState {
  settings: Settings | null;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  settings: null,
  fetchSettings: async () => {
    try {
      const response = await fetch("http://localhost:42069/api/v1/settings", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const settings: Settings = await response.json();
        set({ settings });
        return;
      }

      console.error("Failed to fetch settings");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  },
}));
