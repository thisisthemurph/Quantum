import {useSettingsStore} from "@/stores/SettingsStore.tsx";
import {ReactNode, useEffect} from "react";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>
}