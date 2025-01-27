import { Item, ItemHistoryEvent } from "@/data/models/item";


export function useItemsApi() {
  async function listItems(): Promise<Item[]> {
    const response = await fetch("http://localhost:42069/api/v1/item", {
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
    const response = await fetch(`http://localhost:42069/api/v1/item/groups?max=${max}&filter=${filter}`, {
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
    const groupKeyQuery = groupKeys.map(k => k.trim()).join(",");
    const response = await fetch(`http://localhost:42069/api/v1/item/groups/exist?groups=${groupKeyQuery}`, {
      method: "GET"
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to check group keys");
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
  };
}