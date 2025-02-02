import {
  Card, CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item } from "@/data/models/item";
import {Button} from "@/components/ui/button.tsx";
import {Location} from "@/data/models/location.ts";
import {Link} from "react-router";
import {useSettings} from "@/hooks/use-settings.tsx";
import {Box} from "lucide-react";
import {TrackItemFormDialog} from "@/pages/item-details/TrackItemFormDialog.tsx";
import Barcode from "react-barcode";
import { useUser } from "@/hooks/use-user.ts";

interface ItemDetailsProps {
  item: Item;
  locations: Location[];
  onLocationSearched: (value: string) => void;
  onItemTracked: (values: { locationId: string }) => void;
}

export function ItemDetailsCard({ item, locations, onItemTracked, onLocationSearched }: ItemDetailsProps) {
  const user = useUser();
  const { terminology } = useSettings();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Box size={25} strokeWidth={1} />
            <div className="h-full py-2">{item.reference}</div>
          </CardTitle>
          <Button variant="outline" asChild>
            <Link
              to={`/items/group/${item.groupKey}`}
              className="text-muted-foreground"
              title={`${terminology.item} ${terminology.group.toLowerCase()}`}
            >
              {item.groupKey}
            </Link>
          </Button>
        </div>
        <div className="flex justify-between items-start">
          <CardDescription className="text-lg">{item.description ?? "This item does not have a description"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Barcode value={item.identifier} />
      </CardContent>
      <CardFooter>
        <section className="w-full flex justify-start sm:justify-between items-end gap-2">
          {user.hasTrackerPermissions() && <Button variant="outline">Track to me</Button>}
          {user.hasTrackerPermissions()
            ? <TrackItemFormDialog locations={locations} currentLocationName={item.currentLocation.name} onSearched={onLocationSearched} onSubmit={onItemTracked} />
            : <Button variant="outline" disabled={true}>Current location: {item.currentLocation.name}</Button>}
        </section>
      </CardFooter>
    </Card>
  )
}
