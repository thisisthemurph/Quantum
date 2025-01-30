import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {cn} from "@/lib/utils.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Location} from "@/data/models/location";
import {useSettings} from "@/hooks/use-settings.tsx";

const formSchema = z.object({
  locationId: z.string().min(1, "A location ID must be provided"),
});

export type TrackItemFormValues = z.infer<typeof formSchema>;

interface TrackItemFormProps {
  locations: Location[];
  currentLocationName?: string;
  onSubmit: (values: TrackItemFormValues) => void;
}

export function TrackItemForm({ locations, currentLocationName, onSubmit }: TrackItemFormProps) {
  const { terminology } = useSettings();
  const form = useForm<TrackItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="flex items-center gap-2"
      >
        <FormField
          control={form.control}
          name="locationId"
          render={({field}) => (
            <FormItem className="flex flex-col justify-between w-full space-y-0">
              <FormLabel className="sr-only">Group</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full h-auto mt-0 justify-between", !field.value && "text-muted-foreground")}>
                      {field.value
                        ? locations?.find((location) => location.id === field.value)?.name
                        : currentLocationName ?? "Select a location"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={`Search ${terminology.groups.toLowerCase()}`} />
                    <CommandList>
                      <CommandEmpty>No {terminology.groups.toLowerCase()} found.</CommandEmpty>
                      <CommandGroup>
                        {locations?.map((location) => (
                          <CommandItem value={location.id} key={location.id} onSelect={() => form.setValue("locationId", location.id)}>
                            {location.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                location.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <Button type="submit">Track {terminology.item.toLowerCase()}</Button>
      </form>
    </Form>
  );
}