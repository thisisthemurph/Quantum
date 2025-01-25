import { Item, ItemHistory } from "@/data/models/item";

const items: Item[] = [
  {
    id: "m5gr84i9",
    reference: "HMR1001234",
    description: "This is an item, it is only a test, it is not a real item",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01"
  },
  {
    id: "3u1reuv4",
    reference: "NCA123456",
    description: "This is an item, it is only a test, it is not a real item",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01"
  },
  {
    id: "derv1ws0",
    reference: "NHS100258",
    description: "This is an item, it is only a test, it is not a real item",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01"
  },
  {
    id: "5kma53ae",
    reference: "NHS100526",
    description: "This is an item, it is only a test, it is not a real item",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01"
  },
  {
    id: "bhqecj4p",
    reference: "BOB123654",
    description: "This is an item, it is only a test, it is not a real item",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01"
  },
]

const userTrackedItems = ["m5gr84i9", "3u1reuv4", "derv1ws0"];


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

  async function getItemGroups(): Promise<string[]> {
    const response = await fetch("http://localhost:42069/api/v1/item/groups", {
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
    const userTracked = items.filter((item) => userTrackedItems.includes(item.id));
    return Promise.resolve(userTracked);
  }

  async function getHistory(itemId: string) {
    const itemTrackingHistory: ItemHistory[] = [...Array(6)].map((_, index) => ({
      user: "User Name",
      email: "user.name@example.com",
      location: "Location B",
      date: new Date(Date.now()),
    }));

    return Promise.resolve(itemTrackingHistory);
  }

  return { listItems, getItem, getUserTrackedItems, getHistory, getItemGroups, createItem };
}