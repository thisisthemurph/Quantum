import {Page} from "@/components/page";
import {useItemsApi} from "@/data/api/items.ts";
import {useNavigate} from "react-router";
import {CreateItemForm, CreateItemFormValues} from "@/pages/item-create/CreateItemForm.tsx";
import {useLocationsApi} from "@/data/api/locations.ts";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {useMostRecentlyUsed} from "@/hooks/use-mru.ts";

export default function CreateItemPage() {
  const navigate = useNavigate();
  const { getItemGroups, createItem, groupKeysExist } = useItemsApi();
  const { listLocations } = useLocationsApi();
  const { recentGroups, addGroupToMru } = useMostRecentlyUsed();

  const [groupsFilter, setGroupsFilter] = useState("");
  const [locationsFilter, setLocationsFilter] = useState("");

  const recentlyUsedGroupsQuery = useQuery({
    queryKey: ["favouriteGroupKeys"],
    queryFn: async () => {
      const groupExistence = await groupKeysExist(recentGroups);
      return recentGroups.filter((key) => groupExistence[key]);
    },
  })

  const groupsQuery = useQuery({
    queryKey: ["itemGroups", groupsFilter],
    queryFn: ({ queryKey }) => {
      const [, filter] = queryKey;
      return getItemGroups(5, filter);
    },
  });

  const locationsQuery = useQuery({
    queryKey: ["locations", locationsFilter],
    queryFn: ({ queryKey }) => {
      const [, filter] = queryKey;
      return listLocations(5, filter)
    },
  });

  async function handleSubmit(values: CreateItemFormValues) {
    const newItem = await createItem(values);
    addGroupToMru(values.groupKey);
    navigate(`/items/${newItem.id}`);
  }

  return (
    <Page title="Create a new item">
      <CreateItemForm
        groups={groupsQuery.data ?? []}
        recentGroups={recentlyUsedGroupsQuery.data ?? []}
        locations={locationsQuery.data ?? []}
        onGroupSearched={setGroupsFilter}
        onLocationSearched={setLocationsFilter}
        onSubmit={handleSubmit}
      />
    </Page>
  );
}
