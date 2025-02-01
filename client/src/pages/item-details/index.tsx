import { Page } from "@/components/Page.tsx";
import { useParams } from "react-router";
import { useItemsApi } from "@/data/api/items";
import { toast } from "sonner";

import { ItemDetailsCard } from "./ItemDetailsCard";
import { ItemHistoryCard } from "./ItemHistoryCard";
import { EditItemButton } from "./EditItemButton";
import { useLocationsApi } from "@/data/api/locations.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {useSettings} from "@/hooks/use-settings.tsx";

export default function ItemDetailsPage() {
  const { itemId } = useParams();
  const { getItem, getItemHistory, trackItem, downloadHistoryCsv } = useItemsApi();
  const { listLocations } = useLocationsApi();
  const { terminology } = useSettings();

  const queryClient = useQueryClient();

  const itemQuery = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => {
      if (!itemId) return;
      return getItem(itemId)
    }
  });

  // TODO: Implement a better way of changing the location of the item.
  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: () => listLocations(),
  });

  const itemHistoryQuery = useQuery({
    queryKey: ["item-history", itemId],
    queryFn: () => {
      if (!itemId) return [];
      return getItemHistory(itemId)
    },
  });

  const trackItemMutation = useMutation({
    mutationFn: async ({itemId, locationId}: {itemId: string; locationId: string}) => trackItem(itemId, locationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["item-history", itemId] });
      toast.success("The location of the item has been updated");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  function handleTrackedItem({locationId}: { locationId: string }) {
    if (!itemQuery.data) return;
    if (locationId === itemQuery.data.currentLocation.id) {
      toast.error("The item is already tracked to that location");
      return;
    }
    trackItemMutation.mutate({ itemId: itemQuery.data.id, locationId });
  }

  return (
    <Page title={`${terminology.item} Details`} actionItems={<EditItemButton />}>
      <section className="flex flex-col gap-4">
        {itemQuery.isLoading || !itemQuery.data ? <p>Loading item</p> : <ItemDetailsCard item={itemQuery.data} locations={locationsQuery.data ?? []} onItemTracked={handleTrackedItem} />}
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


