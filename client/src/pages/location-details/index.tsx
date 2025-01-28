import { Page } from "@/components/page";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useLocationsApi } from "@/data/api/locations.ts";
import { LocationDetailsCard } from "@/pages/location-details/LocationDetailsCard.tsx";
import { ItemDataTable } from "@/components/ItemDataTable.tsx";

export default function LocationDetailsPage() {
  const { locationId } = useParams();
  const { getLocation, listItemsAtLocation } = useLocationsApi();

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
    <Page title="Location details">
      {isLocationLoading || !location ? <p>Loading...</p> : <LocationDetailsCard location={location} itemCount={420} />}
      {itemsQuery.isLoading || !itemsQuery.data
        ? <p>Loading...</p>
        : <ItemDataTable data={itemsQuery.data} visibleColumns={{ location: false }} />}
    </Page>
  );
}
