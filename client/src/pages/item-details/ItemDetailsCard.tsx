import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item } from "@/data/models/item";
import {Button} from "@/components/ui/button.tsx";
import {Location} from "@/data/models/location.ts";
import {TrackItemForm} from "@/pages/item-details/TrackItemForm.tsx";
import {Link} from "react-router";

interface ItemDetailsProps {
  item: Item;
  locations: Location[];
  onItemTracked: (values: { locationId: string }) => void;
}

export function ItemDetailsCard({ item, locations, onItemTracked }: ItemDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{item.reference}</CardTitle>
          <Button variant="outline" asChild>
            <Link to={`/items/group/${item.groupKey}`} className="text-muted-foreground" title="Item group">{item.groupKey}</Link>
          </Button>
        </div>
        <div className="flex justify-between items-start">
          <CardDescription>{item.description ?? "This item does not have a description"}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <section className="w-full flex justify-between gap-2">
          <Button variant="outline">Track to me</Button>
          <TrackItemForm currentLocationName={item.currentLocation.name} locations={locations} onSubmit={onItemTracked}/>
        </section>
      </CardFooter>
    </Card>
  )
}
