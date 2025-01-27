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
  const { recentGroups, addGroupToFavourites } = useMostRecentlyUsed();

  const [groupsFilter, setGroupsFilter] = useState("");

  const favouriteGroupsQuery = useQuery({
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
    queryKey: ["locations"],
    queryFn: listLocations,
  });

  async function handleSubmit(values: CreateItemFormValues) {
    const newItem = await createItem(values);
    addGroupToFavourites(values.groupKey);
    navigate(`/items/${newItem.id}`);
  }

  return (
    <Page title="Create a new item">
      <CreateItemForm
        groups={groupsQuery.data ?? []}
        mruGroups={favouriteGroupsQuery.data ?? []}
        locations={locationsQuery.data ?? []}
        onGroupSearched={(value) => {
          setGroupsFilter(value);
        }}
        onSubmit={handleSubmit}
      />
    </Page>
  );
}
