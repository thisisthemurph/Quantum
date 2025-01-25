import {Button} from "@/components/ui/button.tsx";
import {MapPlus} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ReactNode} from "react";

interface CreateNewLocationButtonProps {
  children: ReactNode;
}

export function CreateNewLocationButton({ children }: CreateNewLocationButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="cursor-pointer" asChild>
          <div>
            <MapPlus strokeWidth={1} className="w-5 h-5" />
            <span>Create new location</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-4">{children}</PopoverContent>
    </Popover>
  )
}