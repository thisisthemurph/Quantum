import { useState } from "react";
import {ItemCreatedEvent, ItemHistoryEvent, ItemTrackedEvent} from "@/data/models/item";
import { Button } from "@/components/ui/button";
import {ArrowDownFromLine, ChevronDown, ChevronUp, PackageOpen} from "lucide-react";
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
import {useSettings} from "@/hooks/use-settings.tsx";

interface ItemTrackHistoryProps {
  history: ItemHistoryEvent[];
}

export function ItemHistoryCard({ history }: ItemTrackHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { terminology } = useSettings();

  const NUM_ITEMS_ALWAYS_SHOWN = 3;

  const alwaysVisibleHistory = history.slice(0, NUM_ITEMS_ALWAYS_SHOWN);
  const hiddenHistory = history.slice(NUM_ITEMS_ALWAYS_SHOWN);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{terminology.item} History</CardTitle>
        <CardDescription>A detailed history of where this {terminology.item.toLowerCase()} has been.</CardDescription>
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

            {alwaysVisibleHistory.map((itemHistoryEvent, index) => {
              if (itemHistoryEvent.type === "created") {
                return <ItemCreatedEventDetail key={index} event={itemHistoryEvent}/>
              }
              return <ItemTrackedEventDetail key={index} event={itemHistoryEvent}/>
            })}

            <CollapsibleContent className="flex flex-col gap-1">
              {hiddenHistory.map((track, index) => {
                if (track.type === "created") {
                  return <ItemCreatedEventDetail key={index} event={track}/>
                }
                return <ItemTrackedEventDetail key={index} event={track}/>
              })}
            </CollapsibleContent>
          </section>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ItemTrackedEventDetail({ event }: { event: ItemTrackedEvent }) {
  return (
    <div className="flex justify-between items-center mx-2 hover:bg-gray-50 p-4 rounded-lg">
      <div className="flex gap-2">
        <Avatar>
          <AvatarFallback className="bg-purple-300/80"><ArrowDownFromLine strokeWidth={1} size={18} /></AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-semibold tracking-wide">{event.userName}</p>
          <p className="font-mono text-slate-600">user.name@notimplemented.com</p>
        </div>
      </div>
      <div className="text-sm">
        <p>Tracked to <span className="font-semibold">{event.data.locationName}</span></p>
        <p className="text-slate-600 text-xs text-right">{format(event.date, "PPP HH:mm")}</p>
      </div>
    </div>
  )
}

function ItemCreatedEventDetail({ event }: { event: ItemCreatedEvent }) {
  return (
    <div className="flex justify-between items-center mx-2 hover:bg-gray-50 p-4 rounded-lg">
      <div className="flex gap-2">
        <Avatar>
          <AvatarFallback className="bg-green-500/80"><PackageOpen strokeWidth={1} size={24} /></AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-semibold tracking-wide">{event.userName}</p>
          <p className="font-mono text-slate-600">user.name@notimplemented.com</p>
        </div>
      </div>
      <div className="text-sm">
        <p>Created in <span className="font-semibold">{event.data.locationName}</span></p>
        <p className="text-slate-600 text-xs text-right" title={event.date}>{format(event.date, "PPP HH:mm")}</p>
      </div>
    </div>
  )
}
