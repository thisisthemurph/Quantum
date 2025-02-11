import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { Page } from "@/components/Page.tsx";
import { useParams } from "react-router";
import { useItemsApi } from "@/data/api/items";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs.ts";
import { usePersistentColumns } from "@/hooks/use-persistent-columns.ts";

const visibleColumns = {
  location: true,
  description: false,
  groupKey: false,
  tracked: true,
  created: true,
  updated: true,
};

export default function ItemGroupListingPage() {
  const { groupKey } = useParams();
  const { listItems } = useItemsApi();
  const { terminology } = useSettings();
  const { setBreadcrumbs } = useBreadcrumbs();
  const persistentColumns = usePersistentColumns(
    { key: "items-listing-group", defaults: visibleColumns });

  const { isLoading, data } = useQuery({
    queryKey: ["items", groupKey],
    queryFn: async () => {
      if (!groupKey) return;
      const response = await listItems(groupKey)

      setBreadcrumbs({
        crumbs: [{
          href: "/items",
          text: "Item listing",
        }],
        current: groupKey
      })

      return response;
    },
  });

  return (
    <Page title={groupKey ? `${terminology.group} ${groupKey}` : `${terminology.item} ${terminology.group.toLowerCase()} listing`}>
      {groupKey && data && data?.length > 0 && <p className="text-muted-foreground">All {terminology.items.toLowerCase()} associated with {terminology.group.toLowerCase()} <span className="font-semibold">{groupKey}</span>.</p>}
      {groupKey && data && data?.length === 0 && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not found!</AlertTitle>
          <AlertDescription>
            No {terminology.items.toLowerCase()} associated with {terminology.group.toLowerCase()} <span className="font-semibold">{groupKey}</span>.
          </AlertDescription>
       </Alert>)}
      {isLoading || !data
        ? <p>Loading...</p>
        : <ItemDataTable
            data={data}
            persistentColumns={persistentColumns}
            onDeleteItem={(item) => console.warn(`Deleting item ${item.reference}. Not implemented`)}
          />
      }
    </Page>
  );
}