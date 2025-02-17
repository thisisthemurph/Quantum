import {CreateLocationRequest, Location} from "@/data/models/location";
import {ItemWithCurrentLocation} from "@/data/models/item.ts";

export function useLocationsApi() {
  async function listLocations(max?: number, filter?: string): Promise<Location[]> {
    const params = new URLSearchParams({});
    if (max) {
      params.append("max", max.toString());
    }
    if (filter) {
      params.append("filter", filter);
    }

    const response = await fetch(`http://localhost:42069/api/v1/location?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch locations");
  }

  async function getLocation(locationId: string): Promise<Location> {
    const response = await fetch(`http://localhost:42069/api/v1/location/${locationId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch location");
  }

  async function createLocation(location: CreateLocationRequest): Promise<Location> {
    const response = await fetch("http://localhost:42069/api/v1/location", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location),
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to create location");
  }

  async function deleteLocation(locationId: string): Promise<void> {
    const response = await fetch(`http://localhost:42069/api/v1/location/${locationId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete location");
    }
  }

  async function listItemsAtLocation(locationId: string): Promise<ItemWithCurrentLocation[]> {
    const response = await fetch(`http://localhost:42069/api/v1/location/${locationId}/items`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Failed to fetch items at location");
  }

  return { listLocations, getLocation, createLocation, deleteLocation, listItemsAtLocation };
}