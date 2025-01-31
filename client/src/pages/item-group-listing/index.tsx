import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { Page } from "@/components/Page.tsx";
import { useParams } from "react-router";
import { useItemsApi } from "@/data/api/items";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertCircle } from "lucide-react";
import {useSettings} from "@/hooks/use-settings.tsx";

export default function ItemGroupListingPage() {
  const { groupKey } = useParams();
  const { listItems } = useItemsApi();
  const { terminology } = useSettings();

  const { isLoading, data } = useQuery({
    queryKey: ["items", groupKey],
    queryFn: () => listItems(groupKey),
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
        : <ItemDataTable data={data} visibleColumns={{ location: true, groupKey: false }} />}
    </Page>
  );
}