import { useEffect, useState } from "react";

interface MostRecentlyUsed {
  groups: string[];
  locations: string[];
}

const KEY = "quantum:mru";
const MAX_ITEMS_IN_MRU = 10;
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

  function shiftLeft(arr: string[], target: string): string[] {
    const index = arr.indexOf(target);
    if (index > 0) {
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
    }
    return arr;
  }

  function addGroupToMru(groupKey: string) {
    let groups = [...mru.groups];

    if (groups.includes(groupKey)) {
      groups = shiftLeft(groups, groupKey);
    } else {
      if (groups.length >= MAX_ITEMS_IN_MRU) {
        groups.pop();
      }
      groups.unshift(groupKey);
    }

    setMru((prev) => ({
      ...prev,
      groups: groups,
    }));
  }

  return {
    recentGroups: mru.groups,
    recentLocations: mru.locations,
    addGroupToMru,
  }
}
