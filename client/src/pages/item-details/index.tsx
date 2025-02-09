import { Page } from "@/components/Page.tsx";
import { useParams } from "react-router";
import { useItemsApi } from "@/data/api/items";
import { toast } from "sonner";
import { ItemDetailsCard } from "./ItemDetailsCard";
import { ItemHistoryCard } from "./ItemHistoryCard";
import { EditItemButton } from "./EditItemButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useState } from "react";
import { useUser } from "@/hooks/use-user.ts";
import {useApi} from "@/hooks/use-api.ts";
import {TrackableLocation} from "@/data/models/location.ts";
import {Item, ItemHistoryEvent} from "@/data/models/item.ts";

export default function ItemDetailsPage() {
  const api = useApi();
  const user = useUser();
  const { itemId } = useParams();
  const { downloadHistoryCsv } = useItemsApi();
  const { terminology } = useSettings();
  const [locationFilter, setLocationFilter] = useState("");

  const queryClient = useQueryClient();

  const itemQuery = useQuery({
    queryKey: ["item", itemId],
    queryFn: async () => {
      if (!itemId) return;
      const response = await api<Item>(`/item/${itemId}`);
      if (response.ok) {
        return response.data;
      }
      throw new Error(response.error || `There has been an issue fetching the ${terminology.item.toLowerCase()} data`);
    }
  });

  const locationsQuery = useQuery({
    queryKey: ["locations", locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({});
      if (locationFilter)
        params.append("filter", locationFilter)

      const response = await api<TrackableLocation[]>(`/location?${params.toString()}`);
      if (response.ok) {
        return response.data;
      }

      throw new Error(response.error ?? "Failed to fetch locations");
    },
  });

  const itemHistoryQuery = useQuery({
    queryKey: ["item-history", itemId],
    queryFn: async () => {
      if (!itemId) return [];

      const response = await api<ItemHistoryEvent[]>(`/item/${itemId}/history`);
      if (response.ok) {
        return response.data;
      }

      throw new Error(response.error || `There has been an issue fetching the ${terminology.item.toLowerCase()} history`);
    },
  });

  const trackItemMutation = useMutation({
    mutationFn: async ({ location }: { location: TrackableLocation }) => {
      const url = location.isUser
        ? `/item/${itemId}/track/user/${location.id}`
        : `/item/${itemId}/track/${location.id}`;

      const response = await api<void>(url, { method: "POST" });
      if (response.ok) {
        return location;

      }
      throw new Error(response.error || "There has been an issue tracking the item");
    },
    onSuccess: async (location) => {
      toast.success(`The ${terminology.item.toLowerCase()} has been tracked to a ${location.isUser ? "user" : terminology.location.toLowerCase()}`, {
        description: () => (
          <div className=" mt-2 p-2 w-full rounded bg-black/80 text-white font-mono tracking-wide">
            <p>{location.isUser ? "User" : terminology.location} details:</p>
            <p>- Name: {location.name}</p>
            {location.isUser && <p>- Username: {location.description}</p>}
          </div>
        )
      });

      await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      await queryClient.invalidateQueries({ queryKey: ["item-history", itemId] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const trackToMeItemMutation = useMutation({
    mutationFn: async () => {
      if (!itemQuery.data || !user) return;
      if (itemQuery.data.currentLocation.id === user.id) {
        throw new Error("This item is already tracked to you");
      }

      const result = await api<void>(`/item/${itemQuery.data.id}/track/user/${user.id}`, { method: "POST" });
      if (!result.ok) {
        throw new Error("Failed to track item to you");
      }
    },
    onSuccess: async () => {
      toast.success(`The ${terminology.item.toLowerCase()} has been tracked to you`);
      await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      await queryClient.invalidateQueries({ queryKey: ["item-history", itemId] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  function handleTrackedItem({ location }: { location: TrackableLocation }) {
    if (!itemQuery.data) return;
    if (location.id === itemQuery.data.currentLocation.id) {
      toast.error("The item is already tracked to that location");
      return;
    }

    trackItemMutation.mutate({ location });
  }

  return (
    <Page title={`${terminology.item} Details`} actionItems={user.hasWriterPermissions() && <EditItemButton />}>
      <section className="flex flex-col gap-4">
        {itemQuery.isLoading || !itemQuery.data
          ? <p>Loading item</p>
          : (
            <ItemDetailsCard
              item={itemQuery.data}
              locations={locationsQuery.data ?? []}
              onTracked={handleTrackedItem}
              onTrackedToMe={() => trackToMeItemMutation.mutate()}
              onLocationSearched={setLocationFilter}
            />)}

        {itemHistoryQuery.isLoading
          ? <p>Loading history</p>
          : (
            <ItemHistoryCard
              history={itemHistoryQuery.data ?? []}
              onDownload={() => {
                if (!itemQuery.data) return;
                const item = itemQuery.data;

                downloadHistoryCsv(item.id).then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${terminology.item}-${item.reference}-history.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }} />
          )}
      </section>
    </Page>
  );
}


