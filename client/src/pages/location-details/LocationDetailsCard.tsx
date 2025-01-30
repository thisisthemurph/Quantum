import {Location} from "@/data/models/location";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge.tsx";
import {useSettings} from "@/hooks/use-settings.tsx";

interface LocationDetailsCardProps {
  location: Location;
  itemCount: number;
}

export function LocationDetailsCard({ location, itemCount }: LocationDetailsCardProps) {
  const { terminology } = useSettings();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{location.name}</CardTitle>
          <Badge className="text-xs font-mono tracking-tight px-1">
            {itemCount > 0
              ? `${itemCount} ${terminology.items.toLowerCase()}`
              : `Empty ${terminology.location.toLowerCase()}`}
          </Badge>
        </div>
        <CardDescription className="text-lg">
          {location.description ?? "This location does not have a description"}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}