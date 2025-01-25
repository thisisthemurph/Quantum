import { Page } from "@/components/page";
import { useParams } from "react-router";
import { useItemsApi } from "@/data/api/items";
import { useEffect, useState } from "react";
import { Item, ItemHistoryEvent } from "@/data/models/item";
import { toast } from "sonner";

import { ItemDetailsCard } from "./ItemDetailsCard";
import { ItemHistoryCard } from "./ItemHistoryCard";
import { EditItemButton } from "./EditItemButton";
import {useLocationsApi} from "@/data/api/locations.ts";
import {Location} from "@/data/models/location.ts";

export default function ItemDetailsPage() {
  const { getItem, getItemHistory, trackItem } = useItemsApi();
  const { listLocations } = useLocationsApi();
  const { itemId } = useParams();

  const [item, setItem] = useState<Item | null>(null);
  const [itemHistory, setItemHistory] = useState<ItemHistoryEvent[]>([]);
  const [loadingItem, setLoadingItem] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!itemId) return
    setLoadingItem(true);
    getItem(itemId)
      .then((item) => {
        setItem(item);
        setHasError(false);
      })
      .catch((error) => {
        setHasError(true);
        toast.error(error.message);
      })
      .finally(() => {
        setLoadingItem(false);
      });
  }, [itemId])

  useEffect(() => {
    if (!itemId) return
    setLoadingHistory(true);
    getItemHistory(itemId)
      .then((h) => {
        setItemHistory(h);
        setHasError(false);
      })
      .catch((error) => {
        setHasError(true);
        toast.error(error.message);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [itemId])

  useEffect(() => {
    listLocations()
      .then((locations) => {
        setLocations(locations);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, []);

  function handleTrackedItem({locationId}: { locationId: string }) {
    if (!item) return;
    if (locationId === item?.currentLocation.id) {
      toast.error("The item is already tracked to that location");
      return;
    }
    trackItem(item?.id, locationId)
      .then(() => toast.success("The location of the item has been updated"))
      .catch((error) => toast.error(error.message));
  }

  return (
    <Page title="Item Details" actionItems={<EditItemButton />}>
      {hasError
        ? <p>Something went wrong locating the item...</p>
        : (
          <section className="flex flex-col gap-4">
            {loadingItem || !item ? <p>Loading item</p> : <ItemDetailsCard item={item} locations={locations} onItemTracked={handleTrackedItem} />}
            {loadingHistory ? <p>Loading history</p> : <ItemHistoryCard history={itemHistory} />}
          </section>
        )}
    </Page>
  );
}


