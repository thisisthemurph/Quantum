import {Item, ItemHistoryEvent, ItemWithCurrentLocation} from "@/data/models/item";


export function useItemsApi() {
  async function listItems(groupKey?: string): Promise<ItemWithCurrentLocation[]> {
    let url = "http://localhost:42069/api/v1/item";

    const params = new URLSearchParams();
    if (groupKey) {
      params.append("group", groupKey);
    }
    if (params.size > 0) {
      url = `${url}?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch items");
  }

  async function getItem(itemId: string): Promise<Item> {
    const response = await fetch(`http://localhost:42069/api/v1/item/${itemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch item");
  }

  // getItemGroups returns a list of item groupsKey values.
  // The max parameter is the maximum number of groups to return.
  // The filter parameter is a string to filter the groups.
  async function getItemGroups(max=5, filter=""): Promise<string[]> {
    const params = new URLSearchParams({ max: max.toString() });
    if (filter) {
      params.append("filter", filter);
    }

    const response = await fetch(`http://localhost:42069/api/v1/item/groups?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch item groups");
  }

  async function createItem(item: {reference: string; groupKey: string; description?: string}): Promise<Item> {
    const response = await fetch("http://localhost:42069/api/v1/item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to create item");
  }

  async function getUserTrackedItems() {
    return Promise.resolve([]);
  }

  async function getItemHistory(itemId: string): Promise<ItemHistoryEvent[]> {
    if (!itemId) {
      throw new Error("Invalid item ID");
    }

    const response = await fetch(`http://localhost:42069/api/v1/item/${itemId}/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch item history");
  }

  async function trackItem(itemId: string, locationId: string) {
    const response = await fetch(`http://localhost:42069/api/v1/item/${itemId}/track/${locationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return;
    }

    throw new Error("Failed to track item");
  }

  async function groupKeysExist(groupKeys: string[]): Promise<{[key: string]: boolean }> {
    const params = new URLSearchParams({ groups: groupKeys.map(k => k.trim()).join(",") });
    const response = await fetch(`http://localhost:42069/api/v1/item/groups/exist?${params.toString()}`, {
      method: "GET"
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to check group keys");
  }

  async function downloadHistoryCsv(itemId: string) {
    const response = await fetch(`http://localhost:42069/api/v1/item/${itemId}/history/csv`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return response.blob();
    }

    throw new Error("Failed to download history");
  }

  return {
    listItems,
    getItem,
    getUserTrackedItems,
    getItemHistory,
    getItemGroups,
    createItem,
    trackItem,
    groupKeysExist,
    downloadHistoryCsv,
  };
}