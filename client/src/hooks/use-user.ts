import { useUserStore } from "@/stores/UserStore.tsx";

export const useUser = () => useUserStore((state) => state.user);