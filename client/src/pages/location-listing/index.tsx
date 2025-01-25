import { Page } from "@/components/page";
import { LocationDataTable } from "@/pages/location-listing/LocationDataTable";
import {useLocationsApi} from "@/data/api/locations.ts";
import {useEffect, useState} from "react";
import {Location} from "@/data/models/location.ts";
import {CreateNewLocationButton} from "@/pages/location-listing/CreateNewLocationButton.tsx";
import {CreateLocationForm, CreateLocationFormValues} from "@/pages/location-listing/CreateLocationForm.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {toast} from "sonner";

export default function LocationListingPage() {
  const { listLocations, createLocation, deleteLocation } = useLocationsApi();
  const [locations, setLocations] = useState<Location[]>([]);
  const [deletingLocation, setDeletingLocation] = useState<Location | undefined>();

  useEffect(() => {
    listLocations().then((locations) => {
      setLocations(locations);
    });
  }, []);

  function handleCreateLocation(values: CreateLocationFormValues) {
    console.log(values);
    createLocation({ name: values.name, description: values.description })
      .then((location) => setLocations([location, ...locations]));
  }

  function handleDeleteLocationClicked(location: Location) {
    setDeletingLocation(location);
  }

  function handleDeleteLocationConfirmed() {
    if (!deletingLocation) return;
    deleteLocation(deletingLocation.id)
      .then(() => {
        setLocations(locations.filter((location) => location.id !== deletingLocation.id));
      })
      .then(() => toast.success("Location deleted"))
      .catch(() => toast.error("Failed to delete location"))
      .finally(() => setDeletingLocation(undefined));
  }

  return (
    <Page title="Locations listing" actionItems={
      <CreateNewLocationButton>
        <CreateLocationForm onSubmit={handleCreateLocation} />
      </CreateNewLocationButton>
    }>
      <LocationDataTable data={locations} onDelete={handleDeleteLocationClicked} />

      <AlertDialog open={!!deletingLocation} onOpenChange={(opening) => {
        if (!opening) setDeletingLocation(undefined);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this location?</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Are you sure you want to delete the {deletingLocation?.name} location?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p>
            Are you sure you want to delete the <span className="font-semibold underline underline-offset-2">{deletingLocation?.name}</span> location?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocationConfirmed} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}