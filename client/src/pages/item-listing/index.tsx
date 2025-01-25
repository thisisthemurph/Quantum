import { Button } from "@/components/ui/button";
import { ItemDataTable } from "./ItemDataTable";
import { Item } from "@/data/models/item";
import { Page } from "@/components/page";
import { Link } from "react-router";
import { PackagePlus } from "lucide-react";
import { useItemsApi } from "@/data/api/items";
import { useEffect, useState } from "react";

export default function ItemListingPage() {
  const { listItems } = useItemsApi();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    listItems().then((items: Item[]) => {
      setItems(items);
    });
  }, []);

  return (
    <Page title="Items listing" actionItems={<CreateNewItemButton />}>
      <ItemDataTable data={items} />
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
