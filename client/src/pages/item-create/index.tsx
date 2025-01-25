import { Page } from "@/components/page";
import {useItemsApi} from "@/data/api/items.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {CreateItemForm, CreateItemFormValues} from "@/pages/item-create/CreateItemForm.tsx";
import {Location} from "@/data/models/location";
import {useLocationsApi} from "@/data/api/locations.ts";

export default function CreateItemPage() {
  const navigate = useNavigate();
  const {getItemGroups, createItem} = useItemsApi();
  const {listLocations} = useLocationsApi();
  const [itemGroups, setItemGroups] = useState<string[] | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    getItemGroups().then(setItemGroups);
  }, [])

  useEffect(() => {
    listLocations().then(setLocations);
  }, []);

  async function handleSubmit(values: CreateItemFormValues) {
    const newItem = await createItem(values);
    navigate(`/items/${newItem.id}`);
  }

  return (
    <Page title="Create a new item">
      <CreateItemForm groups={itemGroups} locations={locations} onSubmit={handleSubmit} />
    </Page>
  );
}
