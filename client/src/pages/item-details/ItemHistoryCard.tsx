import { useState } from "react";
import { ItemHistory } from "@/data/models/item";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface ItemTrackHistoryProps {
  history: ItemHistory[];
}

export function ItemHistoryCard({ history }: ItemTrackHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const NUM_ITEMS_ALWAYS_SHOWN = 3

  const alwaysVisibleHistory = history.slice(0, NUM_ITEMS_ALWAYS_SHOWN);
  const hiddenHistory = history.slice(NUM_ITEMS_ALWAYS_SHOWN);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location History</CardTitle>
        <CardDescription>A detailed history of where this item has been.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <section className="flex flex-col gap-1 bg-red-5000">
            {history.length > NUM_ITEMS_ALWAYS_SHOWN && (
              <div className="flex items-center justify-between gap-2">
                <p className="pl-6 text-gray-500 text-sm">Show all tracking information</p>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-6" title="Toggle all tracking information">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            )}

            {alwaysVisibleHistory.map((track, index) => <ItemTrackingInformation key={index} track={track} />)}

            <CollapsibleContent className="flex flex-col gap-1">
              {hiddenHistory.map((track, index) => <ItemTrackingInformation key={index} track={track} />)}
            </CollapsibleContent>
          </section>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ItemTrackingInformation({ track }: { track: ItemHistory }) {
  function getFirstLetters(input: string): string {
    return input
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  return (
    <div className="flex justify-between items-center mx-2 hover:bg-gray-50 p-4 rounded-lg">
      <div className="flex gap-2">
        <Avatar>
          <AvatarFallback>{getFirstLetters(track.user)}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-semibold tracking-wide">{track.user}</p>
          <p className="font-mono text-slate-600">{track.email}</p>
        </div>
      </div>
      <div className="text-sm">
        <p>Tracked to {track.location}</p>
        <p className="text-slate-600">{format(track.date, "PPP")}</p>
      </div>
    </div>
  )
}
