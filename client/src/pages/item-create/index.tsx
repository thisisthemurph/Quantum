import { Page } from "@/components/page";
import {useItemsApi} from "@/data/api/items.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {CreateItemForm, CreateItemFormValues} from "@/pages/item-create/CreateItemForm.tsx";

export default function CreateItemPage() {
  const navigate = useNavigate();
  const {getItemGroups, createItem} = useItemsApi();
  const [itemGroups, setItemGroups] = useState<string[] | null>(null);

  useEffect(() => {
    getItemGroups().then(setItemGroups);
  }, [])

  async function handleSubmit(values: CreateItemFormValues) {
    const newItem = await createItem(values);
    navigate(`/items/${newItem.id}`);
  }

  return (
    <Page title="Create a new item">
      <CreateItemForm groups={itemGroups} onSubmit={handleSubmit} />
    </Page>
  );
}
