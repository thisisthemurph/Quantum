import { Button } from "@/components/ui/button";
import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { Page } from "@/components/Page.tsx";
import { Link } from "react-router";
import { PackagePlus } from "lucide-react";
import { useItemsApi } from "@/data/api/items";
import { useQuery } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings.tsx";

export default function ItemListingPage() {
  const { listItems } = useItemsApi();
  const { terminology } = useSettings();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => listItems(),
  });

  return (
    <Page title={`${terminology.item} listing`} actionItems={<CreateNewItemButton text={`Create new ${terminology.item.toLowerCase()}`} />}>
      <ItemDataTable data={itemsQuery.data ?? []} visibleColumns={{ location: true, description: false }} />
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
