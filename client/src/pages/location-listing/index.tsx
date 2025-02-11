import { Page } from "@/components/Page.tsx";
import { LocationDataTable } from "@/pages/location-listing/LocationDataTable";
import { useLocationsApi } from "@/data/api/locations.ts";
import { useState } from "react";
import { Location } from "@/data/models/location.ts";
import { CreateNewLocationButton } from "@/pages/location-listing/CreateNewLocationButton.tsx";
import { CreateLocationForm, CreateLocationFormValues } from "@/pages/location-listing/CreateLocationForm.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useUser } from "@/hooks/use-user.ts";
import {useBreadcrumbs} from "@/hooks/use-breadcrumbs.ts";

export default function LocationListingPage() {
  const user = useUser();
  const { terminology } = useSettings();
  const { listLocations, createLocation, deleteLocation } = useLocationsApi();
  const [locationPendingDeletion, setLocationPendingDeletion] = useState<Location | undefined>();
  useBreadcrumbs({ current: "Location listing" });

  const queryClient = useQueryClient();
  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: () => listLocations(),
  });

  const deleteLocationMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location deleted");
    },
    onError: () => toast.error("Failed to delete location"),
  });

  function handleCreateLocation(values: CreateLocationFormValues) {
    createLocation({ name: values.name, description: values.description })
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: ["locations"] });
        toast.success(`Location ${values.name} created`);
      })
  }

  function handleDeleteLocationClicked(location: Location) {
    setLocationPendingDeletion(location);
  }

  return (
    <Page title={`${terminology.location} listing`} actionItems={
      user.hasWriterPermissions() && (
        <CreateNewLocationButton>
          <CreateLocationForm onSubmit={handleCreateLocation} />
        </CreateNewLocationButton>
      )
    }>
      <LocationDataTable data={locationsQuery.data ?? []} onDelete={handleDeleteLocationClicked} />

      <AlertDialog open={!!locationPendingDeletion} onOpenChange={(opening) => {
        if (!opening) setLocationPendingDeletion(undefined);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {terminology.location.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Are you sure you want to delete the {locationPendingDeletion?.name} {terminology.location.toLowerCase()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p>
            Are you sure you want to delete the <span className="font-semibold underline underline-offset-2">{locationPendingDeletion?.name}</span> {terminology.location.toLowerCase()}?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              onClick={() => {
                if (!locationPendingDeletion) return;
                deleteLocationMutation.mutate(locationPendingDeletion.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}