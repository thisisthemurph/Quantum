import {Button} from "@/components/ui/button.tsx";
import {MapPlus} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ReactNode} from "react";
import {useSettings} from "@/hooks/use-settings.tsx";

interface CreateNewLocationButtonProps {
  children: ReactNode;
}

export function CreateNewLocationButton({ children }: CreateNewLocationButtonProps) {
  const { terminology } = useSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="cursor-pointer" asChild>
          <div>
            <MapPlus />
            <span>Create new {terminology.location.toLowerCase()}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-4 w-94">{children}</PopoverContent>
    </Popover>
  )
}