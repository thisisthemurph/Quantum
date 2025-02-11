import { Page } from "@/components/Page.tsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { useParams } from "react-router";
import { LocationDetailsCard } from "@/pages/location-details/LocationDetailsCard.tsx";
import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { useSettings } from "@/hooks/use-settings.tsx";
import { usePersistentColumns } from "@/hooks/use-persistent-columns.ts";
import { useApi } from "@/hooks/use-api";
import { Location } from "@/data/models/location";
import {Item, ItemWithCurrentLocation} from "@/data/models/item.ts";
import {toast} from "sonner";
import {ConfirmAlertDialog} from "@/components/ConfirmAlertDialog.tsx";
import {useState} from "react";
import {useBreadcrumbs} from "@/hooks/use-breadcrumbs.ts";

const visibleColumns = {
  location: false,
  description: false,
  groupKey: true,
  tracked: true,
  created: true,
  updated: true,
};

export default function LocationDetailsPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const api = useApi();
  const queryClient = useQueryClient();
  const { terminology } = useSettings();
  const { locationId } = useParams();
  const [itemPendingDeletion, setItemPendingDeletion] = useState<Item | undefined>();
  const persistentColumns = usePersistentColumns({
    key: "location-details-item-listing",
    defaults: visibleColumns,
  });

  const {isLoading: isLocationLoading, data: location} = useQuery({
    queryKey: ["location", locationId],
    queryFn: async () => {
      if (!locationId) return;
      const result = await api<Location>(`/location/${locationId}`);

      setBreadcrumbs({
        crumbs: [{href: "/locations", text: "Location listing"}],
        current: result.data?.name ?? "unknown"
      });

      return result.data;
    },
  });

  const itemsQuery = useQuery({
    queryKey: ["items-at-location", locationId],
    queryFn: async () => {
      if (!locationId) return;
      const result = await api<ItemWithCurrentLocation[]>(`/location/${locationId}/items`);
      return result.data;
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({itemId}: { itemId: string }) => {
      await api<void>(`/item/${itemId}`, { method: "DELETE" });
    },
    onSuccess: async () => {
      toast.success("Item deleted");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: () => {
      toast.error("Failed to delete item")
    },
  });

  return (
    <Page title={`${terminology.location} details`}>
      {isLocationLoading || !location
        ? <p>Loading...</p>
        : <LocationDetailsCard location={location} itemCount={itemsQuery.data?.length ?? 0} />}

      <ItemDataTable
        data={itemsQuery.data ?? []}
        persistentColumns={persistentColumns}
        onDeleteItem={setItemPendingDeletion}
      />

      <ConfirmAlertDialog
        target={itemPendingDeletion!}
        open={!!itemPendingDeletion}
        onOpenChange={(opening) => {
          if (!opening) setItemPendingDeletion(undefined);
        }}
        title={`Delete ${terminology.item.toLowerCase()}`}
        description={(item) => (
          <p>Are you sure you want to delete {terminology.item.toLowerCase()} {" "}
            <span className="font-semibold">{item.reference}</span>?
          </p>
        )}
        confirmText="Delete"
        onConfirm={(item) => deleteItemMutation.mutate({ itemId: item.id })}
      />
    </Page>
  );
}
