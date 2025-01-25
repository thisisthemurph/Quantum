import {CreateLocationRequest, Location} from "@/data/models/location";

export function useLocationsApi() {
  async function listLocations(): Promise<Location[]> {
    const response = await fetch("http://localhost:42069/api/v1/location", {
      method: "GET",
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete location");
    }
  }

  return { listLocations, getLocation, createLocation, deleteLocation };
}