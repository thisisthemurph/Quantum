import { Page } from "@/components/page";
import {useItemsApi} from "@/data/api/items.ts";
import {useNavigate} from "react-router";
import {CreateItemForm, CreateItemFormValues} from "@/pages/item-create/CreateItemForm.tsx";
import {useLocationsApi} from "@/data/api/locations.ts";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";

export default function CreateItemPage() {
  const navigate = useNavigate();
  const { getItemGroups, createItem } = useItemsApi();
  const { listLocations } = useLocationsApi();

  const [groupsFilter, setGroupsFilter] = useState("");

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: listLocations,
  });

  const groupsQuery = useQuery({
    queryKey: ["itemGroups", groupsFilter],
    queryFn: ({ queryKey }) => {
      const [, filter] = queryKey;
      return getItemGroups(5, filter);
    },
  });

  async function handleSubmit(values: CreateItemFormValues) {
    const newItem = await createItem(values);
    navigate(`/items/${newItem.id}`);
  }

  return (
    <Page title="Create a new item">
      <CreateItemForm
        groups={groupsQuery.data ?? []}
        locations={locationsQuery.data ?? []}
        onGroupSearched={(value) => {
          setGroupsFilter(value);
        }}
        onSubmit={handleSubmit}
      />
    </Page>
  );
}
