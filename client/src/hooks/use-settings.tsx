import { useSettingsStore } from "@/stores/SettingsStore.tsx";
import {DefaultSettings} from "@/data/models/settings.ts";

export const useSettings = () => useSettingsStore((state) => state.settings ?? DefaultSettings);
