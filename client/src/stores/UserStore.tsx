import { create } from "zustand";
import { User } from "@/data/models/user.ts";

interface UserStoreState {
  user: User | null;
  setUser: (user: User) => void;
  fetchUser: () => Promise<boolean>;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      const response = await fetch("http://localhost:42069/api/v1/auth/user/refresh", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const user: User = await response.json();
        set({ user });
        return true;
      }

      console.error("Failed to fetch user");
      return false;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return false;
    }
  },
}));
