import { Button } from "@/components/ui/button";
import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { Page } from "@/components/Page.tsx";
import { Link } from "react-router";
import { PackagePlus } from "lucide-react";
import { useItemsApi } from "@/data/api/items";
import { useQuery } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings.tsx";
import { usePersistentColumns } from "@/hooks/use-persistent-columns.ts";
import { useUser } from "@/hooks/use-user.ts";

const visibleColumns = {
  location: true,
  description: false,
  groupKey: true,
  tracked: true,
  created: true,
  updated: true,
};

export default function ItemListingPage() {
  const user = useUser();
  const { listItems } = useItemsApi();
  const { terminology } = useSettings();
  const persistentColumns = usePersistentColumns(
    { key: "items-listing", defaults: visibleColumns });

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => listItems(),
  });

  return (
    <Page title={`${terminology.item} listing`} actionItems={user.hasWriterPermissions() && <CreateNewItemButton text={`Create new ${terminology.item.toLowerCase()}`} />}>
      <ItemDataTable data={itemsQuery.data ?? []} persistentColumns={persistentColumns} />
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
