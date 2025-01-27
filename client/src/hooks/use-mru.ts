import { useEffect, useState } from "react";

interface MostRecentlyUsed {
  groups: string[];
  locations: string[];
}

const KEY = "quantum:mru";
const DEFAULT_MRU: MostRecentlyUsed = {
  groups: [],
  locations: [],
}

export function useMostRecentlyUsed() {
  const [mru, setMru] = useState<MostRecentlyUsed>(() => {
    try {
      const data = localStorage.getItem(KEY);
      return data ? JSON.parse(data) : DEFAULT_MRU;
    } catch {
      console.warn("Failed to load MRU from local storage");
      localStorage.removeItem(KEY);
      return DEFAULT_MRU;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(mru));
  }, [mru]);

  function addGroupToFavourites(groupKey: string) {
    if (mru.groups.includes(groupKey)) return;
    setMru((prev) => ({
      ...prev,
      groups: [...prev.groups, groupKey],
    }));
  }

  return {
    recentGroups: mru.groups,
    recentLocations: mru.locations,
    addGroupToFavourites,
  }
}
