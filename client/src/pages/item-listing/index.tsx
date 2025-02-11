import { Button } from "@/components/ui/button";
import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { Page } from "@/components/Page.tsx";
import { Link } from "react-router";
import { PackagePlus } from "lucide-react";
import { useItemsApi } from "@/data/api/items";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings.tsx";
import { usePersistentColumns } from "@/hooks/use-persistent-columns.ts";
import { useUser } from "@/hooks/use-user.ts";
import { useApi } from "@/hooks/use-api.ts";
import { Item } from "@/data/models/item";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmAlertDialog } from "@/components/ConfirmAlertDialog.tsx";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs.ts";

const visibleColumns = {
  location: true,
  description: false,
  groupKey: true,
  tracked: true,
  created: true,
  updated: true,
};

export default function ItemListingPage() {
  const itemApi = useApi("/item");
  const queryClient = useQueryClient();
  const user = useUser();
  const { listItems } = useItemsApi();
  const { terminology } = useSettings();
  const [itemPendingDeletion, setItemPendingDeletion] = useState<Item | undefined>();
  const persistentColumns = usePersistentColumns(
    { key: "items-listing", defaults: visibleColumns });

  useBreadcrumbs({
    crumbs: [],
    current: "Item listing"
  });

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => listItems(),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({itemId}: { itemId: string }) => {
      await itemApi<void>(`/${itemId}`, { method: "DELETE" });
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
    <Page
      title={`${terminology.item} listing`}
      actionItems={user.hasWriterPermissions() && <CreateNewItemButton text={`Create new ${terminology.item.toLowerCase()}`} />}
    >
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

function CreateNewItemButton({ text }: { text: string }) {
  return (
    <Button variant="outline" asChild>
      <Link to="/items/create" className="flex items-center gap-2">
        <PackagePlus strokeWidth={1} className="w-5 h-5" />
        <span>{text}</span>
      </Link>
    </Button>
  )
}
