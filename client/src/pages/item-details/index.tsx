import { Page } from "@/components/page";
import { useParams } from "react-router";
import { useItemsApi } from "@/data/api/items";
import { useEffect, useState } from "react";
import { Item, ItemHistory } from "@/data/models/item";
import { toast } from "sonner";

import { ItemDetailsCard } from "./ItemDetailsCard";
import { ItemHistoryCard } from "./ItemHistoryCard";
import { EditItemButton } from "./EditItemButton";

export default function ItemDetailsPage() {
  const { getItem, getHistory } = useItemsApi();
  const { itemId } = useParams();

  const [item, setItem] = useState<Item | null>(null);
  const [itemHistory, setItemHistory] = useState<ItemHistory[]>([]);
  const [loadingItem, setLoadingItem] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasError, setHasError] = useState(false);

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
    getHistory(itemId)
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

  return (
    <Page title="Item Details" actionItems={<EditItemButton />}>
      {hasError
        ? <p>Something went wrong locating the item...</p>
        : (
          <section className="flex flex-col gap-4">
            {loadingItem || !item ? <p>Loading item</p> : <ItemDetailsCard item={item} />}
            {loadingHistory ? <p>Loading history</p> : <ItemHistoryCard history={itemHistory} />}
          </section>
        )}
    </Page>
  );
}


