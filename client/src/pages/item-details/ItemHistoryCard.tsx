import {ReactNode, useState } from "react";
import {ItemCreatedEvent, ItemHistoryEvent, ItemTrackedEvent} from "@/data/models/item";
import { Button } from "@/components/ui/button";
import { ArrowDownFromLine, Box, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useSettings } from "@/hooks/use-settings.tsx";
import { Link } from "react-router";
import { cn } from "@/lib/utils.ts";
import { useUser } from "@/hooks/use-user.ts";

interface ItemTrackHistoryProps {
  history: ItemHistoryEvent[];
  onDownload: () => void;
}

export function ItemHistoryCard({ history, onDownload }: ItemTrackHistoryProps) {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { terminology } = useSettings();

  const NUM_ITEMS_ALWAYS_SHOWN = 3;

  const alwaysVisibleHistory = history.slice(0, NUM_ITEMS_ALWAYS_SHOWN);
  const hiddenHistory = history.slice(NUM_ITEMS_ALWAYS_SHOWN);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{terminology.item} History</CardTitle>
          {user.hasReadPermissions() && <Button variant="outline" onClick={onDownload}>Download CSV</Button>}
        </div>
        <CardDescription className="text-lg">A detailed history of where this {terminology.item.toLowerCase()} has been.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <section className="flex flex-col gap-1 bg-red-5000">
            {history.length > NUM_ITEMS_ALWAYS_SHOWN && (
              <div className="flex items-center justify-end gap-2 mb-2">
                <p className="pl-6 text-gray-500 text-sm">Show {isOpen ? "less" : "more"} history</p>
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

function HistoryUserIdentity({ userName, uniqueIdentifier, children, className }: { userName: string, uniqueIdentifier: string, children: ReactNode, className?: string }) {
  return (
    <div className="flex items-center gap-6 overflow-hidden">
      <Avatar className="sm:w-8 sm:h-8 md:h-10 md:w-10">
        <AvatarFallback className={cn("bg-purple-300/80", className)}>
          {children}
        </AvatarFallback>
      </Avatar>
      <div className="sm:text-sm md:text-base">
        <p className="font-semibold tracking-wide" title={uniqueIdentifier}>{userName}</p>
        <p className="font-mono text-slate-600">{uniqueIdentifier}</p>
      </div>
    </div>
  )
}

function HistoryLocationDetail({ variant, locationName, locationId, date }: { variant: "created" | "tracked", locationName: string, locationId: string, date: string }) {
  const prefix = variant === "created" ? "Created in" : "Tracked to";

  return (
    <p className="sm:flex sm:flex-col sm:text-sm md:text-base text-muted-foreground">
      <span className="sm:text-foreground text-right">{prefix} <Link to={`/locations/${locationId}`} className="sm:font-semibold underline underline-offset-2 hover:no-underline">{locationName} </Link></span>
      <span className="sm:text-right sm:font-mono sm:tracking-tight">{format(date, "PPP HH:mm")}</span>
    </p>
  )
}

function ItemTrackedEventDetail({ event }: { event: ItemTrackedEvent }) {
  return (
    <HistoryRow>
      <HistoryUserIdentity userName={event.userName} uniqueIdentifier={event.userUsername}>
        <ArrowDownFromLine strokeWidth={1} size={18} />
      </HistoryUserIdentity>
      <HistoryLocationDetail variant="tracked" locationId={event.data.locationId} locationName={event.data.locationName} date={event.date} />
    </HistoryRow>
  )
}

function ItemCreatedEventDetail({ event }: { event: ItemCreatedEvent }) {
  return (
    <HistoryRow>
      <HistoryUserIdentity
        userName={event.userName}
        uniqueIdentifier={event.userUsername}
        className="bg-green-400/60"
      >
        <Box strokeWidth={1} size={18}/>
      </HistoryUserIdentity>
      <HistoryLocationDetail variant="created" locationId={event.data.locationId} locationName={event.data.locationName} date={event.date} />
    </HistoryRow>
  )
}
