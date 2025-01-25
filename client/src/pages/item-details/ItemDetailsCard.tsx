import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item } from "@/data/models/item";
import {Button} from "@/components/ui/button.tsx";

interface ItemDetailsProps {
  item: Item;
}

export function ItemDetailsCard({ item }: ItemDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
        <CardTitle>{item.reference}</CardTitle>
        <p className="text-muted-foreground" title="Item group">{item.groupKey}</p>
        </div>
        <div className="flex justify-between items-start">
        <CardDescription>{item.description ?? "This item does not have a description"}</CardDescription>
        <Button variant="outline" size="sm">Track to me</Button>
        </div>
      </CardHeader>
    </Card>
  )
}
