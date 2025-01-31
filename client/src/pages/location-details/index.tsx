import { Page } from "@/components/Page.tsx";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useLocationsApi } from "@/data/api/locations.ts";
import { LocationDetailsCard } from "@/pages/location-details/LocationDetailsCard.tsx";
import { ItemDataTable } from "@/components/ItemDataTable/ItemDataTable.tsx";
import { useSettings } from "@/hooks/use-settings.tsx";
import {usePersistentColumns} from "@/hooks/use-persistent-columns.ts";

const visibleColumns = {
  location: false,
  description: false,
  groupKey: true,
  tracked: true,
  created: true,
  updated: true,
};

export default function LocationDetailsPage() {
  const { terminology } = useSettings();
  const { locationId } = useParams();
  const { getLocation, listItemsAtLocation } = useLocationsApi();
  const persistentColumns = usePersistentColumns(
    { key: "location-details-item-listing", defaults: visibleColumns });

  const {isLoading: isLocationLoading, data: location} = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => {
      if (!locationId) return;
      return getLocation(locationId);
    },
  });

  const itemsQuery = useQuery({
    queryKey: ["items-at-location", locationId],
    queryFn: () => {
      if (!locationId) return;
      return listItemsAtLocation(locationId);
    },
  });

  return (
    <Page title={`${terminology.location} details`}>
      {isLocationLoading || !location ? <p>Loading...</p> : <LocationDetailsCard location={location} itemCount={itemsQuery.data?.length ?? 0} />}
      {itemsQuery.isLoading || !itemsQuery.data
        ? <p>Loading...</p>
        : <ItemDataTable data={itemsQuery.data} persistentColumns={persistentColumns} />}
    </Page>
  );
}
