import { Button } from "@/components/ui/button";
import { ItemDataTable } from "../../components/ItemDataTable.tsx";
import { Page } from "@/components/page";
import { Link } from "react-router";
import { PackagePlus } from "lucide-react";
import { useItemsApi } from "@/data/api/items";
import { useQuery } from "@tanstack/react-query";

export default function ItemListingPage() {
  const { listItems } = useItemsApi();

  const itemsQuery = useQuery({ queryKey: ["items"], queryFn: listItems });

  return (
    <Page title="Items listing" actionItems={<CreateNewItemButton />}>
      <ItemDataTable data={itemsQuery.data ?? []} visibleColumns={{ location: true, description: false }} />
    </Page>
  );
}

function CreateNewItemButton() {
  return (
    <Button size="sm" asChild>
      <Link to="/items/create" className="flex items-center gap-2">
        <PackagePlus strokeWidth={1} className="w-5 h-5" />
        <span>Create new item</span>
      </Link>
    </Button>
  )
}
