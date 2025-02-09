import {
  Card, CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item } from "@/data/models/item";
import {Button} from "@/components/ui/button.tsx";
import {TrackableLocation} from "@/data/models/location.ts";
import {Link} from "react-router";
import {useSettings} from "@/hooks/use-settings.tsx";
import {Box, CircleX} from "lucide-react";
import {TrackItemFormDialog} from "@/pages/item-details/TrackItemFormDialog.tsx";
import Barcode from "react-barcode";
import { useUser } from "@/hooks/use-user.ts";
import {useEffect} from "react";
import { toast } from "sonner";

interface ItemDetailsProps {
  item: Item;
  locations: TrackableLocation[];
  onTracked: (values: { location: TrackableLocation }) => void;
  onTrackedToMe: () => void;
  onLocationSearched: (value: string) => void;
}

export function ItemDetailsCard({ item, locations, onTracked, onTrackedToMe, onLocationSearched }: ItemDetailsProps) {
  const user = useUser();
  const { terminology } = useSettings();

  const itemIsDeleted = item.deleted;

  useEffect(() => {
    if (itemIsDeleted) {
      toast.warning(`This ${terminology.item.toLowerCase()} is deleted`);
    }
  }, [itemIsDeleted, terminology.item]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            {item.deleted ? <CircleX className="text-destructive" /> : <Box size={25} strokeWidth={1}/>}
            <div className="h-full py-2">
              {item.deleted && <span>Deleted item: </span>}
              <span>{item.reference}</span>
            </div>
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
          {user.hasTrackerPermissions() && <Button variant="outline" onClick={onTrackedToMe}>Track to me</Button>}
          {user.hasTrackerPermissions()
            ? <TrackItemFormDialog
                locations={locations}
                currentLocation={item.currentLocation}
                onSearched={onLocationSearched}
                onSubmit={onTracked}
              />
            : <Button variant="outline" disabled={true}>Current location: {item.currentLocation.name}</Button>}
        </section>
      </CardFooter>
    </Card>
  )
}
