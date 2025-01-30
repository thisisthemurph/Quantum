import {ReactNode, useState } from "react";
import {ItemCreatedEvent, ItemHistoryEvent, ItemTrackedEvent} from "@/data/models/item";
import { Button } from "@/components/ui/button";
import { ArrowDownFromLine, ChevronDown, ChevronUp } from "lucide-react";
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
import { useSettings } from "@/hooks/use-settings.tsx";

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
        <CardTitle className="text-xl">{terminology.item} History</CardTitle>
        <CardDescription className="text-lg">A detailed history of where this {terminology.item.toLowerCase()} has been.</CardDescription>
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
              {hiddenHistory.map((ev, index) => {
                if (ev.type === "created") {
                  return <ItemCreatedEventDetail key={index} event={ev}/>
                }
                return <ItemTrackedEventDetail key={index} event={ev}/>
              })}
            </CollapsibleContent>
          </section>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function HistoryRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row justify-between sm:items-center text-lg mx-2 p-4 rounded-lg bg-muted/60">
      {children}
    </div>
  )
}

function HistoryUserIdentity({ userName, uniqueIdentifier }: { userName: string, uniqueIdentifier: string }) {
  return (
    <div className="flex items-center gap-6">
      <Avatar>
        <AvatarFallback className="bg-purple-300/80"><ArrowDownFromLine strokeWidth={1} size={18} /></AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold tracking-wide">{userName}</p>
        <p className="font-mono text-slate-600">{uniqueIdentifier}</p>
      </div>
    </div>
  )
}

function HistoryLocationDetail({ variant, locationName, date }: { variant: "created" | "tracked", locationName: string, date: string }) {
  const prefix = variant === "created" ? "Created in" : "Tracked to";

  return (
    <p className="sm:flex sm:flex-col text-muted-foreground">
      <span className="sm:text-foreground">{prefix} <span className="sm:font-semibold">{locationName} </span></span>
      <span className="sm:text-right sm:font-mono sm:tracking-tight">{format(date, "PPP HH:mm")}</span>
    </p>
  )
}

function ItemTrackedEventDetail({ event }: { event: ItemTrackedEvent }) {
  return (
    <HistoryRow>
      <HistoryUserIdentity userName={event.userName} uniqueIdentifier="user.name@notimplemented.com" />
      <HistoryLocationDetail variant="tracked" locationName={event.data.locationName} date={event.date} />
    </HistoryRow>
  )
}

function ItemCreatedEventDetail({ event }: { event: ItemCreatedEvent }) {
  return (
    <HistoryRow>
      <HistoryUserIdentity userName={event.userName} uniqueIdentifier="user.name@notimplemented.com" />
      <HistoryLocationDetail variant="created" locationName={event.data.locationName} date={event.date} />
    </HistoryRow>
  )
}
