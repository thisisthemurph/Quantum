import {format} from "date-fns";
import {cn} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";

export function TimestampCell({ value, className }: { value: Date, className?: string }) {
  return (
    <div title={format(value, "EEE, d MMM yyyy HH:mm")} className={cn("", className)}>
      <Badge variant="secondary" className="font-mono font-normal font-mono tracking-tight truncate">
        {format(value, "PPP HH:mm")}
      </Badge>
    </div>
  )
}